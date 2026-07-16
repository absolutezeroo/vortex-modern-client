import type {HabboToolbar} from './HabboToolbar';
import type {MeMenuController} from './memenu/MeMenuController';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ToolbarView');

/**
 * Main toolbar view that manages the vertical icon bar layout
 *
 * In AS3 this builds the toolbar UI from XML layout, manages icon visibility,
 * hover states, unseen item counters, and the me-menu controller.
 * In Helium, rendering is handled by SolidJS; this class manages state/metadata.
 *
 * @see sources/win63_version/habbo/toolbar/ToolbarView.as
 */
export class ToolbarView
{
    private static readonly DEFAULT_LOCATION = {x: 3, y: 3};
    private static readonly LANDING_VIEW_LOCATION = {x: 3, y: 3};
    private static readonly ICON_BG_COLOR_OVER: number = 0x716769;
    private static readonly ICON_BG_COLOR_OUT: number = 0x57504D;
    private static readonly ICON_MOUSE_OVER: string = '_hover';
    private static readonly ICON_MOUSE_OUT: string = '_normal';
    private static readonly COUNTER_MARGIN: number = 5;
    private static readonly ME_MENU_ICON_NAME: string = 'icon_me_menu';
    private static readonly ICON_REGION_HEIGHT: number = 80;
    private static readonly ICON_LABEL_HEIGHT: number = 20;
    private static readonly WINDOW_BOTTOM_PADDING: number = 52;
    private _toolbar: HabboToolbar | null;
    private _unseenItemCounters: Map<string, unknown> = new Map();
    private _meMenuController: MeMenuController | null = null;
    private _newItemsNotificationEnabled: boolean = false;
    private _newItemsLabelVisible: boolean = false;
    private _iconVisibility: Map<string, boolean> = new Map();
    private _position = {...ToolbarView.DEFAULT_LOCATION};
    private _visible: boolean = true;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/ToolbarView.as::ToolbarView()
        // AS3 resolves this to the name "PROGRESSION", which toolbar_view_xml does not contain (that
        // layout names the child "QUESTS") — so the hide is a no-op there. Kept faithful on purpose.
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_PROGRESSION') ?? '', false);
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_MEMENU') ?? '', false);
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_INVENTORY') ?? '', true);

        this._newItemsNotificationEnabled = this.isNewItemsNotificationEnabled();

        log.debug('ToolbarView constructed');
    }

    private _disposed: boolean = false;

    /**
	 * Whether the view is disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _unseenAchievementCount: number = 0;

    /**
	 * Get the unseen achievement count
	 */
    get unseenAchievementCount(): number
    {
        return this._unseenAchievementCount;
    }

    /**
	 * Set the unseen achievement count
	 */
    set unseenAchievementCount(value: number)
    {
        this._unseenAchievementCount = value;
    }

    private _unseenMiniMailMessageCount: number = 0;

    /**
	 * Get the unseen mini mail message count
	 */
    get unseenMiniMailMessageCount(): number
    {
        return this._unseenMiniMailMessageCount;
    }

    /**
	 * Set the unseen mini mail message count
	 */
    set unseenMiniMailMessageCount(value: number)
    {
        this._unseenMiniMailMessageCount = value;
    }

    /**
	 * Get the me menu controller
	 */
    get memenu(): MeMenuController | null
    {
        return this._meMenuController;
    }

    /**
	 * The link pattern for toolbar links
	 */
    get linkPattern(): string
    {
        return 'toolbar/';
    }

    /**
	 * Set the on duty state
	 */
    set onDuty(value: boolean)
    {
        // Metadata only - UI layer renders the guide icon
    }

    /**
	 * Set the toolbar state and update icon visibility accordingly
	 *
	 * @param state Toolbar state identifier
	 */
    public setToolbarState(state: string): void
    {
        if(state === 'HTE_STATE_HIDDEN')
        {
            this._visible = false;
            return;
        }

        this._visible = true;

        switch(state)
        {
            case 'HTE_STATE_GAME_CENTER_VIEW':
                this._position = {...ToolbarView.DEFAULT_LOCATION};
                break;
            case 'HTE_STATE_HOTEL_VIEW':
                this._position = {...ToolbarView.LANDING_VIEW_LOCATION};
                break;
            case 'HTE_STATE_ROOM_VIEW':
                this._position = {...ToolbarView.DEFAULT_LOCATION};
                break;
        }

        if(this._meMenuController)
        {
            this._meMenuController.reposition();
        }
    }

    /**
	 * Set the visibility of a toolbar icon
	 *
	 * @param iconName Icon name string
	 * @param visible Whether the icon should be visible
	 */
    public iconVisibility(iconName: string, visible: boolean): void
    {
        this._iconVisibility.set(iconName, visible);
    }

    /**
	 * Set the unseen item count for a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param count The count to display, 0 hides the counter
	 */
    public setUnseenItemCount(iconId: string, count: number): void
    {
        const iconName = HabboToolbarIconEnum.getIconName(iconId);

        if(!iconName)
        {
            log.warn(`[Toolbar] Unknown icon type for unseen item counter for iconId: ${iconId}`);
            return;
        }

        this._unseenItemCounters.set(iconId, count);
    }

    /**
	 * Check if new items notification is enabled
	 */
    public isNewItemsNotificationEnabled(): boolean
    {
        if(!this._toolbar) return false;
        return this._toolbar.getBoolean('toolbar.new_additions.notification.enabled');
    }

    /**
	 * Handle a received link event
	 *
	 * @param link The link string
	 */
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'memenu')
        {
            this._meMenuController?.toggleVisibility();
        }
        else
        {
            log.warn(`Toolbar unknown link-type received: ${parts[1]}`);
        }
    }

    /**
	 * Dispose of this view and all its resources
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._meMenuController)
        {
            this._meMenuController.dispose();
            this._meMenuController = null;
        }

        this._unseenItemCounters.clear();
        this._iconVisibility.clear();
        this._toolbar = null;
        this._disposed = true;
    }
}
