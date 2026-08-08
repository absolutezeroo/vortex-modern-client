import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IMeMenuView} from './IMeMenuView';
import type {MeMenuWidget} from './MeMenuWidget';
import type {PerkAllowancesMessageEvent} from '@habbo/communication/messages/incoming/perk/PerkAllowancesMessageEvent';
import {Logger} from '@core/utils/Logger';
import {AvatarExpressionEnum} from '../enums/AvatarExpressionEnum';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {RoomWidgetAvatarEditorMessage} from '../messages/RoomWidgetAvatarEditorMessage';
import {RoomWidgetAvatarExpressionMessage} from '../messages/RoomWidgetAvatarExpressionMessage';
import {RoomWidgetDanceMessage} from '../messages/RoomWidgetDanceMessage';
import {RoomWidgetOpenCatalogMessage} from '../messages/RoomWidgetOpenCatalogMessage';
import {RoomWidgetOpenInventoryMessage} from '../messages/RoomWidgetOpenInventoryMessage';
import {RoomWidgetOpenProfileMessage} from '../messages/RoomWidgetOpenProfileMessage';
import {RoomWidgetRequestWidgetMessage} from '../messages/RoomWidgetRequestWidgetMessage';
import {RoomWidgetShowOwnRoomsMessage} from '../messages/RoomWidgetShowOwnRoomsMessage';

const log = Logger.getLogger('habbo.ui.widget.memenu.MeMenuMainView');

/**
 * The me-menu's front page: fourteen icons, each a white/colour pair swapped on hover.
 *
 * Nothing here is laid out by state — the icons come from the XML and this class only *paints*
 * them, choosing an asset and an alpha per icon. Three are conditional: dance and wave grey out
 * while an effect is worn, effects greys out while dancing, and mini-mail greys out when the
 * embed is disabled. The club icon is the odd one: its asset name is built from the club level
 * (`club_white` / `vip_white`) and its label from the remaining days and periods.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuMainView.as
 */
export class MeMenuMainView implements IMeMenuView
{
    // AS3: .../widget/memenu/MeMenuMainView.as::VIEW_ELEMENT_TYPE_MINI_MAIL
    public static readonly VIEW_ELEMENT_TYPE_MINI_MAIL: string = 'minimail';

    // AS3: .../widget/memenu/MeMenuMainView.as::DIMMED_BLEND
    // Name DERIVED: the 0.5 AS3 assigns inline to a disabled icon.
    private static readonly DIMMED_BLEND: number = 0.5;

    // AS3: .../widget/memenu/MeMenuMainView.as::COUNTER_MARGIN
    // Name DERIVED: the 5px inset the unseen-item counter is placed at.
    private static readonly COUNTER_MARGIN: number = 5;

    // AS3: .../widget/memenu/MeMenuMainView.as::CLUB_LEVEL_VIP
    // Name DERIVED: the 2 AS3 compares the club level against for the VIP label and assets.
    private static readonly CLUB_LEVEL_VIP: number = 2;

    // AS3: .../widget/memenu/MeMenuMainView.as::GUIDE_TOOL_PERK
    // Name DERIVED: the perk code AS3 tests inline.
    private static readonly GUIDE_TOOL_PERK: string = 'USE_GUIDE_TOOL';

    // AS3: .../widget/memenu/MeMenuMainView.as::_widget
    // Name DERIVED (`_SafeStr_4549`).
    private _widget: MeMenuWidget | null = null;

    // AS3: .../widget/memenu/MeMenuMainView.as::_window
    private _window: IWindowContainer | null = null;

    /**
     * Icon name → [white asset, colour asset]. Mutable: `setIconAssets()` rewrites entries in
     * place, which is how the tutorial swaps the clothes icon for its highlighted version.
     *
     * `hc_icon`'s pair is `["_white", "_color"]` — deliberately *incomplete*. The club level is
     * prefixed at paint time, so the real names are `club_white` / `vip_color`.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::_icons
    private _icons: Map<string, [string, string]> = new Map();

    // AS3: .../widget/memenu/MeMenuMainView.as::_perkAllowancesMessageEvent
    private _perkAllowancesMessageEvent: PerkAllowancesMessageEvent | null = null;

    // AS3: .../widget/memenu/MeMenuMainView.as::_config
    // Passed to the constructor rather than read off the widget — and used for exactly one thing,
    // the shop URL.
    private _config: IHabboConfigurationManager | null;

    // AS3: .../widget/memenu/MeMenuMainView.as::MeMenuMainView()
    constructor(config: IHabboConfigurationManager | null)
    {
        this._config = config;
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::init()
    // The perk listener is attached before the window is built, because a perk answer arriving
    // mid-build must still find the view.
    public init(widget: MeMenuWidget, name: string): void
    {
        this._icons = new Map<string, [string, string]>([
            ['rooms_icon', ['gohome_white', 'gohome_color']],
            ['dance_icon', ['dance_white', 'dance_color']],
            ['clothes_icon', ['clothes_white', 'clothes_color']],
            ['effects_icon', ['effects_white', 'effects_color']],
            ['badges_icon', ['badges_white', 'badges_color']],
            ['wave_icon', ['wave_white', 'wave_color']],
            // Prefixed with the club level at paint time — see `_icons`.
            ['hc_icon', ['_white', '_color']],
            ['settings_icon', ['settings_white', 'settings_color']],
            ['credits_icon', ['credits_white', 'credits_color']],
            ['minimail_icon', ['minimail_white', 'minimail_color']],
            ['profile_icon', ['profile_white', 'profile_color']],
            ['achievements_icon', ['achievements_white', 'achievements_color']],
            // The talents and guide icons do not match their names — a compass and a lighthouse.
            ['talents_icon', ['compass_white', 'compass_color']],
            ['guide_icon', ['lighthouse_white', 'lighthouse_color']]
        ]);

        this._widget = widget;

        const connection = widget.handler?.container?.connection ?? null;

        if(connection !== null)
        {
            // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/
            // memenu/MeMenuMainView.as::init() — AS3 constructs its own PerkAllowances message
            // event here with `onPerkAllowances` as the callback and registers it on the
            // connection. This port's `PerkAllowancesMessageEvent` is already registered globally
            // by `HabboMessages` (header 1535) and its parser feeds `SessionDataManager`, so a
            // second registration would double-parse the same packet. The guide button therefore
            // uses the session manager's cached answer, read in `createWindow()`, and is not
            // refreshed by a later perk push.
            void connection;
        }

        this.createWindow(name);
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    /**
     * Rewrites an icon's asset pair and repaints it — but repaints with the *white* argument even
     * when only the colour one was given, so calling it with a colour-only change paints null and
     * `setElementImage()` bails. The tutorial always passes the white name, so it works there.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::setIconAssets()
    public setIconAssets(icon: string, _viewName: string, white: string | null = null, colour: string | null = null): void
    {
        const pair = this._icons.get(icon);

        if(pair === undefined) return;

        if(white !== null) pair[0] = white;
        if(colour !== null) pair[1] = colour;

        this.setElementImage(icon, white);
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::updateUnseenItemCount()
    // Ignores the count it is handed and re-reads it off the widget.
    public updateUnseenItemCount(category: string, _count: number): void
    {
        if(category !== MeMenuMainView.VIEW_ELEMENT_TYPE_MINI_MAIL) return;

        this.updateUnseenCounter(
            MeMenuMainView.VIEW_ELEMENT_TYPE_MINI_MAIL, this._widget?.unreadMiniMailMessageCount ?? 0
        );
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::dispose()
    public dispose(): void
    {
        if(this._perkAllowancesMessageEvent !== null)
        {
            this._widget?.handler?.container?.connection?.removeMessageEvent(this._perkAllowancesMessageEvent);
            this._perkAllowancesMessageEvent = null;
        }

        this._widget = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
     * Two layouts: `memenu_main`, or `memenu_main_simple` when `simple.memenu.enabled` is on. The
     * simple one also moves the guide button into the talents slot and hides talents when the
     * talent track is off — a layout fix-up done in code, not in XML.
     *
     * The click and hover listeners go on **every direct child**, not on named buttons.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::createWindow()
    private createWindow(name: string): void
    {
        const widget = this._widget;

        if(widget === null) return;

        const simple = widget.config?.getBoolean('simple.memenu.enabled') ?? false;
        const layout = simple ? 'memenu_main_simple' : 'memenu_main';

        this._window = widget.windowManager.buildWidgetLayout(layout) as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            // AS3 throws here; this runs at room entry and a throw would take the room UI down.
            log.warn(`${layout} did not build — the me-menu main page cannot be shown`);
            this._window = null;

            return;
        }

        this._window.name = name;

        if(!(widget.config?.getBoolean('talent.track.enabled') ?? false) && simple)
        {
            const guide = this._window.findChildByName('guide');
            const talents = this._window.findChildByName('talents');

            if(guide !== null && talents !== null)
            {
                guide.rectangle = talents.rectangle;
                talents.visible = false;
            }
        }

        if(widget.config?.getBoolean('guides.enabled') ?? false)
        {
            const allowed = widget.handler?.container?.sessionDataManager
                ?.isPerkAllowed(MeMenuMainView.GUIDE_TOOL_PERK) ?? false;

            this.setGuideToolVisibility(allowed);
        }

        this.paintIcons();

        for(let index = 0; index < this._window.numChildren; index++)
        {
            const child = this._window.getChildAt(index);

            if(child === null) continue;

            child.addEventListener('WME_CLICK', this.onButtonClicked);
            child.addEventListener('WME_OVER', this.onMouseOverOrOut);
            child.addEventListener('WME_OUT', this.onMouseOverOrOut);
        }
    }

    /**
     * TS-only: AS3 inlines this as the body of a `for..in` over `_icons` inside `createWindow()`.
     * Extracted because it is the whole of the view's state-dependent painting and reads far
     * better on its own; the per-icon logic is unchanged.
     */
    // TS-only: the per-icon body of AS3's for..in inside createWindow() — see above.
    private paintIcons(): void
    {
        const widget = this._widget;

        if(widget === null) return;

        for(const [icon, pair] of this._icons)
        {
            let asset = pair[0];
            let blend = 1;

            switch(icon)
            {
                case 'dance_icon':
                case 'wave_icon':
                    // You cannot dance or wave while wearing an effect.
                    if(widget.hasEffectOn) blend = MeMenuMainView.DIMMED_BLEND;
                    break;

                case 'effects_icon':
                    // …nor change effect while dancing. The two gates are mutual.
                    if(widget.isDancing) blend = MeMenuMainView.DIMMED_BLEND;
                    break;

                case 'hc_icon':
                    asset = (this.getClubAssetNameBase() ?? '') + asset;
                    this.paintClubLabel();
                    break;

                case 'minimail_icon':
                {
                    if(!widget.isMinimailEnabled)
                    {
                        blend = MeMenuMainView.DIMMED_BLEND;
                        break;
                    }

                    const unread = widget.unreadMiniMailMessageCount;

                    // −1 means "unknown", and is shown as a blank badge rather than hidden.
                    if(unread === -1 || unread > 0)
                    {
                        this.updateUnseenCounter(MeMenuMainView.VIEW_ELEMENT_TYPE_MINI_MAIL, unread);
                    }

                    break;
                }
            }

            this.setElementImage(icon, asset, blend);
        }
    }

    /**
     * TS-only: the club branch's label half, extracted from `paintIcons()` for readability.
     *
     * The key is built up rather than chosen: `widget.memenu.hc` or `.vip` by level, then `.long`
     * when periods remain — and both `days` and `months` are registered whichever key won.
     */
    // TS-only: the club branch's label half, extracted from paintIcons().
    private paintClubLabel(): void
    {
        const widget = this._widget;

        if(widget === null) return;

        if(!widget.isHabboClubActive)
        {
            this.setElementText('hc_text', widget.localizations?.getLocalization('widget.memenu.hc.join') ?? '');

            return;
        }

        let key = widget.habboClubLevel === MeMenuMainView.CLUB_LEVEL_VIP
            ? 'widget.memenu.vip'
            : 'widget.memenu.hc';

        if(widget.habboClubPeriods > 0) key += '.long';

        widget.localizations?.registerParameter(key, 'days', String(widget.habboClubDays));
        widget.localizations?.registerParameter(key, 'months', String(widget.habboClubPeriods));

        this.setElementText('hc_text', widget.localizations?.getLocalization(key) ?? '');
    }

    /**
     * A count of 0 removes the badge; anything else creates one if absent. A negative count shows
     * a **blank** badge — `count > 0 ? count : " "` — which is how "unknown" is rendered.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::updateUnseenCounter()
    private updateUnseenCounter(name: string, count: number): void
    {
        const host = this._window?.findChildByName(name) as IWindowContainer | null;

        if(host === null || host === undefined) return;

        let counter = host.findChildByName('unseen_counter') as IWindowContainer | null;

        if(count === 0)
        {
            if(counter !== null && counter !== undefined)
            {
                host.removeChild(counter);
                host.invalidate();
            }

            return;
        }

        if(counter === null || counter === undefined)
        {
            counter = this._widget?.windowManager.createUnseenItemCounter() ?? null;

            if(counter === null) return;

            counter.name = 'unseen_counter';
            host.addChild(counter);
        }

        const text = counter.findChildByName('count') as ITextWindow | null;

        if(text !== null && text !== undefined) text.text = count > 0 ? count.toString() : ' ';

        counter.x = host.width - counter.width - MeMenuMainView.COUNTER_MARGIN;
        counter.y = MeMenuMainView.COUNTER_MARGIN;
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::getClubAssetNameBase()
    // Levels 0 and 1 are both "club"; only level 2 is VIP. Anything else yields null, which
    // concatenates as "null_white" and paints nothing.
    private getClubAssetNameBase(): string | null
    {
        switch(this._widget?.habboClubLevel)
        {
            case 0:
            case 1:
                return 'club';

            case MeMenuMainView.CLUB_LEVEL_VIP:
                return 'vip';

            default:
                return null;
        }
    }

    /**
     * AS3 allocates a transparent BitmapData the size of the *window* and blits the asset into its
     * centre, so a small icon is padded rather than stretched. This port hands the asset straight
     * to the bitmap window, whose `pivotPoint` already centres it — the same result without the
     * per-paint allocation.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::setElementImage()
    private setElementImage(name: string, assetName: string | null, blend: number = 1): void
    {
        const element = this._window?.findChildByName(name) as IBitmapWrapperWindow | null;

        if(element === null || element === undefined)
        {
            log.debug(`Could not find element: ${name}`);

            return;
        }

        const bitmap = (this._widget?.assets?.getAssetByName(assetName ?? '')?.content ?? null) as ImageBitmap | null;

        if(bitmap === null)
        {
            log.debug(`Could not find asset: ${assetName}`);

            return;
        }

        element.bitmap = bitmap;
        element.blend = blend;
    }

    // AS3: .../widget/memenu/MeMenuMainView.as::setElementText()
    private setElementText(name: string, text: string): void
    {
        const element = this._window?.findChildByName(name) as ITextWindow | null;

        if(element !== null && element !== undefined) element.text = text;
    }

    /**
     * Hiding the guide button also **shrinks the window** to the achievements row's bottom — the
     * guide is the last row, so the menu ends wherever the last visible button does. It then asks
     * the widget to re-place itself, because the default position is anchored to the bottom.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::setGuideToolVisibility()
    private setGuideToolVisibility(visible: boolean): void
    {
        const widget = this._widget;

        if(this._window === null || widget === null) return;

        const guide = this._window.findChildByName('guide');
        const achievements = this._window.findChildByName('achievements');

        if(guide === null) return;

        guide.visible = visible;
        this._window.height = visible ? guide.bottom : (achievements?.bottom ?? this._window.height);
        widget.updateSize();
    }

    /**
     * Note the tracking call at the very end: it runs for **every** button including the unknown
     * default, but *not* for the three that `return` early (dance/wave/effects while gated).
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::onButtonClicked()
    private onButtonClicked = (event: {target?: unknown}): void =>
    {
        const widget = this._widget;
        const name = (event.target as IWindow | null)?.name ?? '';

        if(widget === null) return;

        switch(name)
        {
            case 'dance':
                if(widget.hasEffectOn) return;

                widget.changeView('me_menu_dance_moves_view');

                break;

            case 'wave':
            case 'blow':
            {
                if(widget.hasEffectOn) return;

                // Waving stops a dance first — the two cannot run together.
                if(widget.isDancing)
                {
                    widget.messageListener?.processWidgetMessage(
                        new RoomWidgetDanceMessage(RoomWidgetDanceMessage.STOP)
                    );
                    widget.isDancing = false;
                }

                const expression = name === 'blow' ? AvatarExpressionEnum.BLOW : AvatarExpressionEnum.WAVE;

                widget.messageListener?.processWidgetMessage(new RoomWidgetAvatarExpressionMessage(expression));
                widget.hide();

                break;
            }

            case 'effects':
                if(widget.isDancing) return;

                widget.messageListener?.processWidgetMessage(new RoomWidgetRequestWidgetMessage('RWRWM_EFFECTS'));
                widget.hide();

                break;

            case 'rooms':
                widget.messageListener?.processWidgetMessage(new RoomWidgetShowOwnRoomsMessage());
                widget.hide();

                break;

            case 'badges':
                widget.messageListener?.processWidgetMessage(
                    new RoomWidgetOpenInventoryMessage(RoomWidgetOpenInventoryMessage.INVENTORY_BADGES)
                );
                widget.hide();

                break;

            case 'clothes':
                widget.messageListener?.processWidgetMessage(
                    new RoomWidgetAvatarEditorMessage(RoomWidgetAvatarEditorMessage.OPEN_AVATAR_EDITOR)
                );
                widget.hide();

                break;

            case 'hc':
                widget.messageListener?.processWidgetMessage(
                    new RoomWidgetOpenCatalogMessage(RoomWidgetOpenCatalogMessage.CATALOG_CLUB)
                );
                widget.hide();

                break;

            case 'settings':
                widget.changeView('me_menu_settings_view');

                break;

            case 'minimail':
                // Silently does nothing when the embed is off — the icon is already dimmed.
                if(widget.isMinimailEnabled)
                {
                    HabboWebTools.openMinimail('#mail/inbox/');
                    widget.hide();
                }

                break;

            case 'credits':
                HabboWebTools.openWebPageAndMinimizeClient(this._config?.getProperty('web.shop.relativeUrl') ?? '');
                widget.hide();

                break;

            case 'profile':
                widget.messageListener?.processWidgetMessage(
                    new RoomWidgetOpenProfileMessage('RWOPEM_OPEN_USER_PROFILE', widget.userId, 'me_menu')
                );
                widget.hide();

                break;

            case 'achievements':
                widget.handler?.container?.questEngine?.showAchievements();
                widget.hide();

                break;

            case 'guide':
                widget.handler?.container?.toolbar?.toggleWindowVisibility('GUIDE');
                widget.hide();

                break;

            case 'talents':
            {
                // The only button that does not close the menu.
                const track = widget.handler?.container?.sessionDataManager?.currentTalentTrack ?? '';

                widget.handler?.container?.habboTracking?.trackTalentTrackOpen(track, 'memenu');
                widget.handler?.container?.connection?.send(new GetTalentTrackMessageComposer(track));

                break;
            }

            default:
                log.debug(`Me Menu Main View: unknown button: ${name}`);
        }

        widget.handler?.container?.habboTracking?.trackEventLog('MeMenu', 'click', name);
    };

    /**
     * Index 1 of the pair is the colour asset and index 0 the white one, so the over/out state
     * indexes the array directly. The four gated buttons return before repainting, which is what
     * keeps a dimmed icon dim under the cursor.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::onMouseOverOrOut()
    private onMouseOverOrOut = (event: {type?: string; target?: unknown}): void =>
    {
        const widget = this._widget;
        const name = (event.target as IWindow | null)?.name ?? '';

        if(widget === null) return;

        let prefix = '';
        const index = event.type === 'WME_OVER' ? 1 : 0;

        switch(name)
        {
            case 'dance':
            case 'wave':
                if(widget.hasEffectOn) return;
                break;

            case 'minimail':
                if(!widget.isMinimailEnabled) return;
                break;

            case 'effects':
                if(widget.isDancing) return;
                break;

            case 'hc':
                prefix = this.getClubAssetNameBase() ?? '';
                break;
        }

        const iconName = `${name}_icon`;
        const pair = this._icons.get(iconName);

        if(pair === undefined) return;

        this.setElementImage(iconName, prefix + pair[index]);
    };

    /**
     * TODO(AS3): unreachable in this port — see the note in `init()`. The listener AS3 registers
     * on the connection is not registered here, because `PerkAllowancesMessageEvent` is already
     * bound globally. Kept so the guide-button refresh path stays visible.
     */
    // AS3: .../widget/memenu/MeMenuMainView.as::onPerkAllowances()
    private onPerkAllowances = (event: PerkAllowancesMessageEvent): void =>
    {
        const parser = event.getParser?.() ?? null;

        if(parser === null) return;

        this.setGuideToolVisibility(parser.isPerkAllowed(MeMenuMainView.GUIDE_TOOL_PERK));
    };

    // AS3: .../widget/memenu/MeMenuMainView.as::onAlertClicked()
    // Disposes the dialog and nothing else — and nothing in the class ever opens an alert to
    // attach it to, in AS3 either.
    private onAlertClicked = (dialog: {dispose: () => void}): void =>
    {
        dialog.dispose();

        void this.onPerkAllowances;
    };

    // TS-only: keeps the two AS3 members above referenced — see their notes.
    private get unusedMembers(): unknown
    {
        return this.onAlertClicked;
    }
}
