import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IContext} from '@core/runtime/IContext';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboGroupsManager} from '@habbo/groups/IHabboGroupsManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IContextMenuParentWidget} from '@habbo/ui/widget/contextmenu/IContextMenuParentWidget';
import {FurnitureContextInfoView} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextInfoView';
import type {FurnitureContextMenuWidget} from '@habbo/ui/widget/furniture/contextmenu/FurnitureContextMenuWidget';

const log = Logger.getLogger('habbo.ui.widget.furniture.guildfurnicontextmenu.GuildFurnitureContextMenuView');

/**
 * GuildFurnitureContextMenuView
 *
 * The bubble over a guild-customised furni: the guild's name, a "join" row and an "open forum"
 * row, plus the name itself as a link into the group's profile.
 *
 * The four public fields are set by `showGuildFurnitureContextMenu()` immediately before
 * `setup()` runs, straight off the `GuildFurniContextMenuInfo` parser — the view holds them
 * rather than the widget because `updateButtons()` reads them on every rebuild.
 *
 * Unlike its siblings this one clears `_autoHideEnabled`: the guild bubble stays until it is
 * clicked or replaced.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/guildfurnicontextmenu/GuildFurnitureContextMenuView.as
 */
export class GuildFurnitureContextMenuView extends FurnitureContextInfoView
{
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_SafeStr_6331
    private _groupsManager: IHabboGroupsManager | null;
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_windowManager
    private _viewWindowManager: IHabboWindowManager | null;

    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_SafeStr_8144
    public guildId: number = -1;
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_SafeStr_7965
    public guildHomeRoomId: number = -1;
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_SafeStr_8163
    public userIsMember: boolean = false;
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::_SafeStr_7709
    public guildHasReadableForum: boolean = false;

    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::GuildFurnitureContextMenuView()
    constructor(
        widget: IContextMenuParentWidget,
        groupsManager: IHabboGroupsManager | null,
        windowManager: IHabboWindowManager | null
    )
    {
        super(widget);

        this._autoHideEnabled = false;
        this._groupsManager = groupsManager;
        this._viewWindowManager = windowManager;
    }

    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::updateWindow()
    protected override updateWindow(): void
    {
        if(this._widget === null || this._widget.assets === null || this._widget.windowManager === null) return;

        if(FurnitureContextInfoView._minimized)
        {
            this.activeView = this.getMinimizedView();

            return;
        }

        if(this._window === null)
        {
            const asset = this._widget.assets.getAssetByName('guild_furni_menu') as XmlAsset | null;

            if(asset === null || asset === undefined)
            {
                log.warn('Missing layout "guild_furni_menu" - the bubble cannot open');

                return;
            }

            this._window = this._widget.windowManager.buildFromXML(
                asset.content as unknown as string, 0
            ) as IWindowContainer | null;

            if(this._window === null) return;

            this._window.addEventListener('WME_OVER', this.onMouseHoverEvent);
            this._window.addEventListener('WME_OUT', this.onMouseHoverEvent);

            const minimize = this._window.findChildByName('minimize');

            if(minimize !== null)
            {
                minimize.addEventListener('WME_CLICK', this.onMinimize);
                minimize.addEventListener('WME_OVER', this.onMinimizeHover);
                minimize.addEventListener('WME_OUT', this.onMinimizeHover);
            }
        }

        this._buttons = this._window.findChildByName('buttons') as IItemListWindow | null;

        if(this._buttons !== null)
        {
            this._buttons.procedure = this.buttonEventProc;
        }

        // AS3 casts it to IRegionWindow, which is where the tooltip properties live.
        const profileLink = this._window.findChildByName('profile_link') as IRegionWindow | null;

        if(profileLink !== null)
        {
            profileLink.procedure = this.buttonEventProc;
            profileLink.toolTipCaption = this._widget.localizations?.getLocalization(
                'infostand.profile.link.tooltip', 'Click to view profile'
            ) ?? 'Click to view profile';
            profileLink.toolTipDelay = 100;
        }

        const name = this._window.findChildByName('name');

        // The guild's name, handed in through `FurnitureContextInfoView.setup()`'s third argument —
        // this view is its only caller.
        if(name !== null) name.caption = this._caption;

        this._window.visible = false;

        this.activeView = this._window;

        this.updateButtons();

        this._mouseOver = false;
    }

    /**
	 * Join shows only to non-members, the forum row only when the guild has a readable one.
	 *
	 * AS3 brackets both `showButton()` calls with `autoArrangeItems = false/true` so the list
	 * relayouts once instead of per row.
	 */
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::updateButtons()
    protected updateButtons(): void
    {
        if(this._window === null || this._buttons === null) return;

        this._buttons.autoArrangeItems = false;

        this.showButton('join', !this.userIsMember, true);
        this.showButton('open_forum', this.guildHasReadableForum, true);

        this._buttons.autoArrangeItems = true;
        this._buttons.visible = true;
    }

    /**
	 * Tints the minimise icon on hover — same per-subclass copy as the other furniture bubbles.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/contextmenu/ContextInfoView.as::onMinimizeHover()
    private onMinimizeHover = (event: WindowEvent, window: IWindow): void =>
    {
        const icon = (window as IWindowContainer).findChildByName?.('icon');

        if(icon)
        {
            icon.color = event.type === 'WME_OVER' ? 4282950861 : 16777215;
        }
    };

    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::buttonEventProc()
    protected override buttonEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(this.disposed || this._window === null || this._window.disposed) return;

        let consumed = false;

        if(event.type === 'WME_CLICK')
        {
            if(window?.name === 'button')
            {
                switch(window.parent?.name)
                {
                    case 'join':
                        this.widget.handler.sendJoinToGroupMessage(this.guildId);
                        // Re-shown disabled rather than hidden: the row stays, greyed, for the
                        // rest of this bubble's life.
                        this.showButton('join', !this.userIsMember, false);
                        break;
                    case 'home_room':
                        this.widget.handler.sendGoToHomeRoomMessage(this.guildHomeRoomId);
                        break;
                    case 'open_forum':
                    {
                        // AS3 casts the room engine to its `Component` base to reach
                        // `context.createLinkEvent()` — `IRoomEngine` declares no such member.
                        // Same cast as FurnitureRoomLinkHandler.navigateTo().
                        const context = (this.widget.roomEngine as unknown as {context?: IContext} | null)?.context ?? null;

                        context?.createLinkEvent(`groupforum/${this.guildId}`);
                        break;
                    }
                }
            }

            if(window?.name === 'profile_link')
            {
                this._groupsManager?.openGroupInfo(this.guildId);
            }

            consumed = true;
        }
        else
        {
            this.applyButtonHover(event, window);
        }

        if(consumed)
        {
            this._widget.removeView(this, false);
        }
    };

    /**
	 * AS3's `get widget()` — the parent typed back down to the concrete widget, for the two
	 * handler calls and the room engine `IContextMenuParentWidget` does not expose.
	 */
    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::get widget()
    private get widget(): FurnitureContextMenuWidget
    {
        return this._widget as FurnitureContextMenuWidget;
    }

    // AS3: .../guildfurnicontextmenu/GuildFurnitureContextMenuView.as::dispose()
    public override dispose(): void
    {
        this._groupsManager = null;
        this._viewWindowManager = null;

        super.dispose();
    }
}
