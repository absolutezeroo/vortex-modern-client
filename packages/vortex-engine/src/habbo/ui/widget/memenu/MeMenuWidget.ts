import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import type {MeMenuWidgetHandler} from '../../handler/MeMenuWidgetHandler';
import type {IMeMenuView} from './IMeMenuView';
import {Logger} from '@core/utils/Logger';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import {RoomWidgetMeMenuMessage} from '../messages/RoomWidgetMeMenuMessage';
import {RoomWidgetAvatarEditorUpdateEvent} from '../events/RoomWidgetAvatarEditorUpdateEvent';
import {RoomWidgetDanceUpdateEvent} from '../events/RoomWidgetDanceUpdateEvent';
import {RoomWidgetHabboClubUpdateEvent} from '../events/RoomWidgetHabboClubUpdateEvent';
import {RoomWidgetMiniMailUpdateEvent} from '../events/RoomWidgetMiniMailUpdateEvent';
import {RoomWidgetPurseUpdateEvent} from '../events/RoomWidgetPurseUpdateEvent';
import {RoomWidgetRoomEngineUpdateEvent} from '../events/RoomWidgetRoomEngineUpdateEvent';
import {RoomWidgetSettingsUpdateEvent} from '../events/RoomWidgetSettingsUpdateEvent';
import {RoomWidgetToolbarClickedUpdateEvent} from '../events/RoomWidgetToolbarClickedUpdateEvent';
import {RoomWidgetTutorialEvent} from '../events/RoomWidgetTutorialEvent';
import {RoomWidgetUpdateEffectsUpdateEvent} from '../events/RoomWidgetUpdateEffectsUpdateEvent';
import {RoomWidgetUserInfoUpdateEvent} from '../events/RoomWidgetUserInfoUpdateEvent';
import {RoomWidgetWaveUpdateEvent} from '../events/RoomWidgetWaveUpdateEvent';
import {MeMenuDanceView} from './MeMenuDanceView';
import {MeMenuMainView} from './MeMenuMainView';
import {MeMenuSettingsMenuView} from './MeMenuSettingsMenuView';
import {MeMenuSoundSettingsView} from './soundsettings/MeMenuSoundSettingsView';

const log = Logger.getLogger('habbo.ui.widget.memenu.MeMenuWidget');

/**
 * The me-menu itself: one window whose single content slot is swapped between four views.
 *
 * It holds no state of its own beyond what the handler pushes at it — club days, credits, effects,
 * game mode — and every view reads that back off the widget rather than off a manager. `changeView`
 * is the whole navigation model: it disposes the old view, builds the new one, and drops it into
 * the layout's `MAIN_CONTENT` slot at index 0.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuWidget.as
 */
export class MeMenuWidget extends RoomWidgetBase
{
    // AS3: .../widget/memenu/MeMenuWidget.as::MAIN_VIEW
    public static readonly MAIN_VIEW: string = 'me_menu_top_view';

    // AS3: .../widget/memenu/MeMenuWidget.as::MY_CLOTHES_VIEW
    // No case in `changeView()` builds it — the avatar editor owns that view. The widget only ever
    // *tests* for the name, to decide whether an editor-closed event should send it back to the
    // main view.
    public static readonly MY_CLOTHES_VIEW: string = 'me_menu_my_clothes_view';

    // AS3: .../widget/memenu/MeMenuWidget.as::DANCE_MOVES_VIEW
    // Name DERIVED (`_SafeStr_10966`), from its value.
    public static readonly DANCE_MOVES_VIEW: string = 'me_menu_dance_moves_view';

    // AS3: .../widget/memenu/MeMenuWidget.as::SETTINGS_VIEW
    // Name DERIVED (`_SafeStr_11053`), from its value.
    public static readonly SETTINGS_VIEW: string = 'me_menu_settings_view';

    // AS3: .../widget/memenu/MeMenuWidget.as::SOUND_SETTINGS_VIEW
    public static readonly SOUND_SETTINGS_VIEW: string = 'me_menu_sound_settings';

    // AS3: .../widget/memenu/MeMenuWidget.as::DEFAULT_VIEW_LOCATION_BOTTOM
    // The menu's bottom-left corner when the simple layout is off — y is the *bottom*, so the
    // window's own height is subtracted from it.
    private static readonly DEFAULT_VIEW_LOCATION_BOTTOM: {x: number; y: number} = {x: 95, y: 440};

    // AS3: .../widget/memenu/MeMenuWidget.as::VIEW_PADDING
    // Name DERIVED: the 5 AS3 uses inline as both the view's offset inside the container and the
    // margin added to the container's size.
    private static readonly VIEW_PADDING: number = 5;

    // AS3: .../widget/memenu/MeMenuWidget.as::_view
    // Name DERIVED (`_SafeStr_4612`): the one view currently in the content slot.
    private _view: IMeMenuView | null = null;

    // AS3: .../widget/memenu/MeMenuWidget.as::_window
    // Name DERIVED (`_SafeStr_4565`): built lazily by `mainContainer`, never in the constructor.
    private _window: IWindowContainer | null = null;

    // AS3: .../widget/memenu/MeMenuWidget.as::_habboClubDays
    // Name DERIVED (`_SafeStr_8098`): behind `get habboClubDays()`.
    private _habboClubDays: number = 0;

    // AS3: .../widget/memenu/MeMenuWidget.as::_habboClubPeriods
    // Name DERIVED (`_SafeStr_9886`).
    private _habboClubPeriods: number = 0;

    // AS3: .../widget/memenu/MeMenuWidget.as::_habboClubPastPeriods
    // Name DERIVED (`_SafeStr_10237`): stored from the club event and read by nothing.
    private _habboClubPastPeriods: number = 0;

    // AS3: .../widget/memenu/MeMenuWidget.as::_allowHabboClubDances
    private _allowHabboClubDances: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_habboClubLevel
    // Name DERIVED (`_SafeStr_8408`).
    private _habboClubLevel: number = 0;

    // AS3: .../widget/memenu/MeMenuWidget.as::_hasEffectOn
    // Name DERIVED (`_SafeStr_7786`).
    private _hasEffectOn: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_isDancing
    // Name DERIVED (`_SafeStr_7727`): written by the views, never by this class.
    private _isDancing: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_isOpen
    // Name DERIVED (`_SafeStr_5514`): the toggle state the toolbar click flips.
    private _isOpen: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_isMinimailEnabled
    // Name DERIVED (`_SafeStr_9010`).
    private _isMinimailEnabled: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_creditBalance
    // Name DERIVED (`_SafeStr_9835`): kept only so the localisation parameter can be re-registered.
    private _creditBalance: number = 0;

    // AS3: .../widget/memenu/MeMenuWidget.as::_isGameMode
    // Written by the two mode events and read by nothing, in AS3 too.
    private _isGameMode: boolean = false;

    // AS3: .../widget/memenu/MeMenuWidget.as::_config
    private _config: IHabboConfigurationManager | null;

    // AS3: .../widget/memenu/MeMenuWidget.as::_userId
    // Name DERIVED (`_SafeStr_5971`): the *web* id from the own-user event, not the room id.
    private _userId: number = 0;

    /**
     * AS3 gates the minimail flag on `ExternalInterface.available` — whether the SWF can call into
     * the page. This port *is* the page, so the bridge is always available and the config flag
     * alone decides.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuWidget.as::MeMenuWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        config: IHabboConfigurationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._config = config;
        this._isMinimailEnabled = config?.getBoolean('client.minimail.embed.enabled') ?? false;

        (handler as MeMenuWidgetHandler).widget = this;

        this.changeView(MeMenuWidget.MAIN_VIEW);
        this.hide();
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get handler()
    public get handler(): MeMenuWidgetHandler | null
    {
        return (this._handler as MeMenuWidgetHandler | null) ?? null;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get mainWindow()
    public override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get config()
    public get config(): IHabboConfigurationManager | null
    {
        return this._config;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get allowHabboClubDances()
    public get allowHabboClubDances(): boolean
    {
        return this._allowHabboClubDances;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get isHabboClubActive()
    // Days, not periods — a subscription with periods left but no days reads as inactive.
    public get isHabboClubActive(): boolean
    {
        return this._habboClubDays > 0;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get habboClubDays()
    public get habboClubDays(): number
    {
        return this._habboClubDays;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get habboClubPeriods()
    public get habboClubPeriods(): number
    {
        return this._habboClubPeriods;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get habboClubLevel()
    public get habboClubLevel(): number
    {
        return this._habboClubLevel;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get isMinimailEnabled()
    public get isMinimailEnabled(): boolean
    {
        return this._isMinimailEnabled;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get hasEffectOn()
    public get hasEffectOn(): boolean
    {
        return this._hasEffectOn;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get isDancing()
    public get isDancing(): boolean
    {
        return this._isDancing;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::set isDancing()
    public set isDancing(value: boolean)
    {
        this._isDancing = value;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::get unreadMiniMailMessageCount()
    public get unreadMiniMailMessageCount(): number
    {
        return this.handler?.container?.messenger?.getUnseenMiniMailMessageCount() ?? 0;
    }

    /**
     * Swaps the content slot. An unknown name logs and leaves the current view alone — but
     * `updateSize()` still runs, so a bad name resizes the window around the view already there.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuWidget.as::changeView()
    public changeView(name: string): void
    {
        let next: IMeMenuView | null = null;

        switch(name)
        {
            case MeMenuWidget.MAIN_VIEW:
                next = new MeMenuMainView(this._config);
                break;

            case MeMenuWidget.DANCE_MOVES_VIEW:
                next = new MeMenuDanceView();
                break;

            case MeMenuWidget.SETTINGS_VIEW:
                next = new MeMenuSettingsMenuView();
                break;

            case MeMenuWidget.SOUND_SETTINGS_VIEW:
                next = new MeMenuSoundSettingsView();
                break;

            default:
                log.debug(`Me Menu Change view: unknown view: ${name}`);
        }

        if(next !== null)
        {
            if(this._view !== null)
            {
                this._view.dispose();
                this._view = null;
            }

            this._view = next;
            this._view.init(this, name);

            const container = this.mainContainer;
            const window = this._view.window;

            if(container !== null && window !== null)
            {
                container.removeChildAt(0);
                container.addChildAt(window, 0);
            }

            if(this._window !== null)
            {
                this._window.visible = true;
                this._window.activate();
            }
        }

        this.updateSize();
    }

    /**
     * Sizes the container to the view plus a 5px margin, then places the whole menu.
     *
     * Two placements: beside the toolbar when `simple.memenu.enabled` is on, otherwise at a fixed
     * point whose y is the menu's *bottom* — which is why the container has to be sized first.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/memenu/MeMenuWidget.as::updateSize()
    public updateSize(): void
    {
        const view = this._view?.window ?? null;
        const container = this.mainContainer;

        if(view === null || this._window === null || container === null) return;

        const padding = MeMenuWidget.VIEW_PADDING;

        view.position = {x: padding, y: padding};
        container.width = view.width + padding * 2;
        container.height = view.height + padding * 2;

        const toolbar = this.handler?.container?.toolbar ?? null;

        if((this._config?.getBoolean('simple.memenu.enabled') ?? false) && toolbar !== null)
        {
            const rect = toolbar.getRect();

            this._window.x = (rect.x + rect.width) + padding;
            this._window.y = (rect.y + rect.height) - this._window.height;

            return;
        }

        this._window.x = MeMenuWidget.DEFAULT_VIEW_LOCATION_BOTTOM.x;
        this._window.y = MeMenuWidget.DEFAULT_VIEW_LOCATION_BOTTOM.y - container.height;
    }

    /**
     * AS3: .../widget/memenu/MeMenuWidget.as::registerUpdateEvents()
     *
     * Seventeen listeners. Note the asymmetry with `unregisterUpdateEvents()`: the two mini-mail
     * types are subscribed here and **never removed**, and the two avatar-editor types are removed
     * against the *wrong* callbacks — AS3 swaps them. Both are kept; see `unregisterUpdateEvents`.
     */
    public override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetMiniMailUpdateEvent.NEW_MESSAGE_NOTIFICATION, this.onMiniMailUpdate);
        events.on(RoomWidgetMiniMailUpdateEvent.UNREAD_MESSAGE_COUNT, this.onMiniMailUpdate);
        events.on(RoomWidgetWaveUpdateEvent.WAVE, this.onWaveEvent);
        events.on(RoomWidgetDanceUpdateEvent.DANCE, this.onDanceEvent);
        events.on(RoomWidgetUpdateEffectsUpdateEvent.UPDATE_EFFECTS, this.onUpdateEffects);
        events.on(RoomWidgetToolbarClickedUpdateEvent.REQUEST_ME_MENU_TOOLBAR_CLICKED_EVENT, this.onToolbarClicked);
        events.on(RoomWidgetAvatarEditorUpdateEvent.AVATAR_EDITOR_CLOSED, this.onAvatarEditorClosed);
        events.on(RoomWidgetAvatarEditorUpdateEvent.HIDE_AVATAR_EDITOR, this.onHideAvatarEditor);
        events.on('RWROUE_OBJECT_DESELECTED', this.onAvatarDeselected);
        events.on(RoomWidgetHabboClubUpdateEvent.HABBO_CLUB, this.onHabboClubEvent);
        events.on(RoomWidgetUserInfoUpdateEvent.OWN_USER, this.onUserInfo);
        events.on(RoomWidgetSettingsUpdateEvent.SETTINGS, this.onSettingsUpdate);
        events.on(RoomWidgetTutorialEvent.AVATAR_EDITOR_STARTED, this.onTutorialEvent);
        events.on(RoomWidgetTutorialEvent.AVATAR_EDITOR_HIGHLIGHT, this.onTutorialEvent);
        events.on(RoomWidgetPurseUpdateEvent.CREDIT_BALANCE, this.onCreditBalance);
        events.on(RoomWidgetRoomEngineUpdateEvent.NORMAL_MODE, this.onNormalMode);
        events.on(RoomWidgetRoomEngineUpdateEvent.GAME_MODE, this.onGameMode);

        super.registerUpdateEvents(events);
    }

    /**
     * AS3: .../widget/memenu/MeMenuWidget.as::unregisterUpdateEvents()
     *
     * Three AS3 defects kept verbatim, because "fixing" them would change what survives a widget
     * teardown:
     *
     *  - the two **mini-mail** types are never removed at all;
     *  - the two **avatar-editor** types are removed against each other's callbacks
     *    (`AVATAR_EDITOR_CLOSED` → `onHideAvatarEditor`), so neither listener actually comes off;
     *  - `GAME_MODE` is removed by passing `NORMAL_MODE` a second time, so the game-mode listener
     *    stays and the normal-mode one is removed twice.
     *
     * There is also no `super.unregisterUpdateEvents()` call, unlike `registerUpdateEvents()`.
     */
    public override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetWaveUpdateEvent.WAVE, this.onWaveEvent);
        events.off(RoomWidgetDanceUpdateEvent.DANCE, this.onDanceEvent);
        events.off(RoomWidgetUpdateEffectsUpdateEvent.UPDATE_EFFECTS, this.onUpdateEffects);
        events.off(RoomWidgetToolbarClickedUpdateEvent.REQUEST_ME_MENU_TOOLBAR_CLICKED_EVENT, this.onToolbarClicked);
        events.off('RWROUE_OBJECT_DESELECTED', this.onAvatarDeselected);
        events.off(RoomWidgetHabboClubUpdateEvent.HABBO_CLUB, this.onHabboClubEvent);
        events.off(RoomWidgetAvatarEditorUpdateEvent.AVATAR_EDITOR_CLOSED, this.onHideAvatarEditor);
        events.off(RoomWidgetAvatarEditorUpdateEvent.HIDE_AVATAR_EDITOR, this.onAvatarEditorClosed);
        events.off(RoomWidgetUserInfoUpdateEvent.OWN_USER, this.onUserInfo);
        events.off(RoomWidgetSettingsUpdateEvent.SETTINGS, this.onSettingsUpdate);
        events.off(RoomWidgetTutorialEvent.AVATAR_EDITOR_HIGHLIGHT, this.onTutorialEvent);
        events.off(RoomWidgetTutorialEvent.AVATAR_EDITOR_STARTED, this.onTutorialEvent);
        events.off(RoomWidgetPurseUpdateEvent.CREDIT_BALANCE, this.onCreditBalance);
        events.off(RoomWidgetRoomEngineUpdateEvent.NORMAL_MODE, this.onNormalMode);
        events.off(RoomWidgetRoomEngineUpdateEvent.NORMAL_MODE, this.onGameMode);
    }

    /**
     * Removes the view from `_window` — not from `mainContainer`, where `changeView()` put it. The
     * remove therefore finds nothing and the view stays parented until the next `changeView()`
     * replaces it; only `visible = false` actually hides the menu. Kept.
     */
    // AS3: .../widget/memenu/MeMenuWidget.as::hide()
    public hide(): void
    {
        if(this._view !== null)
        {
            const viewWindow = this._view.window;

            // AS3 passes the view window unguarded; the port's removeChild is non-null, and a
            // view whose layout failed to build has none.
            if(viewWindow !== null) this._window?.removeChild(viewWindow);

            this._view.dispose();
            this._view = null;
        }

        if(this._window !== null) this._window.visible = false;

        this._isOpen = false;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::release()
    public override release(): void
    {
        this.hide();

        super.release();
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        this.hide();

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._window = null;
        this._config = null;

        super.dispose();
    }

    /**
     * Builds the outer window on first access rather than in the constructor, then hands back the
     * layout's `MAIN_CONTENT`-tagged child — the slot every view is dropped into.
     */
    // AS3: .../widget/memenu/MeMenuWidget.as::get mainContainer()
    private get mainContainer(): IWindowContainer | null
    {
        if(this._window === null)
        {
            this._window = this.windowManager.buildWidgetLayout('memenu') as IWindowContainer | null;

            if(this._window === undefined) this._window = null;
        }

        if(this._window === null) return null;

        return this._window.findChildByTag('MAIN_CONTENT') as IWindowContainer | null;
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::onUserInfo()
    // The *web* id, which is what the menu's profile link needs.
    private onUserInfo = (event: RoomWidgetUserInfoUpdateEvent): void =>
    {
        this._userId = event.webID;
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onSettingsUpdate()
    // Only the sound view wants this, and only while the menu is open.
    private onSettingsUpdate = (event: RoomWidgetSettingsUpdateEvent): void =>
    {
        if(!this._isOpen || this._view === null) return;

        if(this._view.window?.name === MeMenuWidget.SOUND_SETTINGS_VIEW)
        {
            (this._view as MeMenuSoundSettingsView).updateSettings(event);
        }
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onTutorialEvent()
    // The highlight only lands if the menu is open *and* showing the main view; the start event
    // closes the menu outright so the editor has the screen.
    private onTutorialEvent = (event: RoomWidgetTutorialEvent): void =>
    {
        switch(event.type)
        {
            case RoomWidgetTutorialEvent.AVATAR_EDITOR_HIGHLIGHT:
                if(!this._isOpen || this._view?.window?.name !== MeMenuWidget.MAIN_VIEW) return;

                (this._view as MeMenuMainView).setIconAssets(
                    'clothes_icon', MeMenuWidget.MAIN_VIEW, 'clothes_highlighter_blue'
                );

                break;

            case RoomWidgetTutorialEvent.AVATAR_EDITOR_STARTED:
                this.hide();

                break;
        }
    };

    /**
     * The toggle. Clicking while already open does **not** close the menu if something else is
     * covering it — it raises it instead, so the first click after another window steals focus
     * brings the menu back rather than dismissing it.
     */
    // AS3: .../widget/memenu/MeMenuWidget.as::onToolbarClicked()
    private onToolbarClicked = (_event: RoomWidgetToolbarClickedUpdateEvent): void =>
    {
        if(this._isOpen)
        {
            if(this._window !== null && WindowToggle.isHiddenByOtherWindows(this._window))
            {
                this._window.activate();

                return;
            }

            this._isOpen = false;
        }
        else
        {
            this._isOpen = true;
        }

        if(!this._isOpen)
        {
            this.hide();

            return;
        }

        // Opening asks the handler for everything the menu shows — club, purse, own avatar.
        this.messageListener?.processWidgetMessage(
            new RoomWidgetMeMenuMessage(RoomWidgetMeMenuMessage.ME_MENU_OPENED)
        );

        this.changeView(MeMenuWidget.MAIN_VIEW);
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onUpdateEffects()
    // Recomputed from scratch on every update — one effect in use is enough.
    private onUpdateEffects = (event: RoomWidgetUpdateEffectsUpdateEvent): void =>
    {
        this._hasEffectOn = false;

        for(const effect of event.effects ?? [])
        {
            if(effect.isInUse) this._hasEffectOn = true;
        }
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onAvatarDeselected()
    // Clicking away closes the menu — unless the clothes view is up, which the editor owns.
    private onAvatarDeselected = (): void =>
    {
        if(this._view !== null && this._view.window?.name !== MeMenuWidget.MY_CLOTHES_VIEW)
        {
            this.hide();
        }
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onAvatarEditorClosed()
    private onAvatarEditorClosed = (): void =>
    {
        this.returnFromClothesView();
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onHideAvatarEditor()
    // Identical body to onAvatarEditorClosed() in AS3 — kept as two methods because
    // `unregisterUpdateEvents()` distinguishes them (wrongly, but it does).
    private onHideAvatarEditor = (): void =>
    {
        this.returnFromClothesView();
    };

    // TS-only: the shared body of the two avatar-editor handlers above.
    private returnFromClothesView(): void
    {
        if(this._view !== null && this._view.window?.name === MeMenuWidget.MY_CLOTHES_VIEW)
        {
            this.changeView(MeMenuWidget.MAIN_VIEW);
        }
    }

    // AS3: .../widget/memenu/MeMenuWidget.as::onWaveEvent()
    // Logs and nothing else, in AS3 too.
    private onWaveEvent = (): void =>
    {
        log.debug('[MeMenuWidget] Wave Event received');
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onMiniMailUpdate()
    // Both mini-mail types land here and ask the messenger for the count itself — the event
    // carries none.
    private onMiniMailUpdate = (): void =>
    {
        this._view?.updateUnseenItemCount('minimail', this.unreadMiniMailMessageCount);
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onDanceEvent()
    // Logs and nothing else, in AS3 too — `isDancing` is set by the views, not from here.
    private onDanceEvent = (event: RoomWidgetDanceUpdateEvent): void =>
    {
        log.debug(`[MeMenuWidget] Dance Event received, style: ${event.style}`);
    };

    /**
     * Rebuilds the current view only when the **days** or the **level** changed — periods and past
     * periods are stored and ignored for that test, so a period-only change updates the fields
     * without redrawing.
     */
    // AS3: .../widget/memenu/MeMenuWidget.as::onHabboClubEvent()
    private onHabboClubEvent = (event: RoomWidgetHabboClubUpdateEvent): void =>
    {
        let changed = event.daysLeft !== this._habboClubDays;

        this._habboClubDays = event.daysLeft;
        this._habboClubPeriods = event.periodsLeft;
        this._habboClubPastPeriods = event.pastPeriods;
        this._allowHabboClubDances = event.allowClubDances;

        changed = changed || event.clubLevel !== this._habboClubLevel;
        this._habboClubLevel = event.clubLevel;

        if(changed && this._view !== null && this._view.window !== null)
        {
            this.changeView(this._view.window.name);
        }

        void this._habboClubPastPeriods;
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onCreditBalance()
    // Registers the balance as a localisation parameter rather than pushing it to a view — the
    // credits label resolves `%credits%` out of the string table.
    private onCreditBalance = (event: RoomWidgetPurseUpdateEvent): void =>
    {
        if(event === null) return;

        this._creditBalance = event.balance;
        this.localizations?.registerParameter('widget.memenu.credits', 'credits', this._creditBalance.toString());
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onNormalMode()
    private onNormalMode = (): void =>
    {
        this._isGameMode = false;
    };

    // AS3: .../widget/memenu/MeMenuWidget.as::onGameMode()
    // `_isGameMode` is written by both handlers and read by nothing, in AS3 too.
    private onGameMode = (): void =>
    {
        this._isGameMode = true;

        void this._isGameMode;
    };
}
