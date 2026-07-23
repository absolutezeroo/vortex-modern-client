import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IMessageComposer} from '@core';
import type {IWindow} from '@core/window/IWindow';
import {Logger} from '@core/utils/Logger';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomUI} from '@iid/IIDRoomUI';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_WiredMenuController} from '@iid/IIDWiredMenuController';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';

import type {IHabboUserDefinedRoomEvents} from './IHabboUserDefinedRoomEvents';
import type {IUserDefinedRoomEventsCtrl} from './wired_setup/IUserDefinedRoomEventsCtrl';
import {UserDefinedRoomEventsCtrl} from './wired_setup/UserDefinedRoomEventsCtrl';
import {WiredVariablesSynchronizer} from './WiredVariablesSynchronizer';
import {WiredMenuController} from './wired_menu/WiredMenuController';
import {WiredEnvironment} from './WiredEnvironment';
import {NewVariablePickerHelper} from './wired_setup/uibuilder/presets/newvariablepicker/NewVariablePickerHelper';
import {IncomingMessages} from './IncomingMessages';
import {WiredClickUserMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/WiredClickUserMessageComposer';

const log = Logger.getLogger('HabboUserDefinedRoomEvents');

/**
 * HabboUserDefinedRoomEvents — the top-level "wired" component. Owns the wired-setup controller
 * (wiredCtrl), the room-events menu (wiredMenu), the WiredEnvironment (room-wide click settings /
 * achievements / click-user), and — in the full client — the incoming-message handler, the variable
 * synchronizer and the wired-trading controllers. Acts as the shared context every wired
 * sub-controller is constructed with.
 *
 * Scope note (wired_setup milestone): only wiredCtrl (stub — Bloc C), wiredMenu (stub) and
 * WiredEnvironment are wired here. The incoming handler (IncomingMessages / _SafeCls_1951), the
 * WiredVariablesSynchronizer, and the wired-trading controllers (chest / transaction logs+details /
 * contract / reward-notification / self-donation / new-variable-picker) are deferred — see the
 * TODO(AS3) block in initComponent() and the getters section. The AS3 also creates every
 * sub-controller in the constructor; this port defers creation to initComponent() so DI dependencies
 * (communication, etc.) are resolved first — the same pattern as HabboHelp.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/HabboUserDefinedRoomEvents.as
 */
export class HabboUserDefinedRoomEvents extends Component implements IHabboUserDefinedRoomEvents
{
    private _communication: IHabboCommunicationManager | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _notifications: IHabboNotifications | null = null;
    private _roomEngine: IRoomEngine | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _roomUI: IRoomUI | null = null;
    private _toolbar: IHabboToolbar | null = null;

    private _roomSession: IRoomSession | null = null;
    private _roomSessionManager: IRoomSessionManager | null = null;
    private _userName: string = '';

    // Created in initComponent() (see scope note).
    private _wiredCtrl!: UserDefinedRoomEventsCtrl;

    // AS3: HabboUserDefinedRoomEvents.as::_variablesSynchronizer
    private _variablesSynchronizer!: WiredVariablesSynchronizer;
    private _wiredMenu!: WiredMenuController;
    private _wiredEnvironment!: WiredEnvironment;

    // AS3: HabboUserDefinedRoomEvents.as::_variablePickerHelper (shared state for the variable picker).
    private _variablePickerHelper!: NewVariablePickerHelper;

    private _incomingMessages: IncomingMessages | null = null;

    // TODO(AS3): deferred sub-controllers, all created in the AS3 constructor and exposed via getters
    // (variablesSynchronizer/wiredChest/transactionLogs/transactionDetails/rewardNotificationController/
    // selfDonationTool/transactionDetails) and the WiredContractController. Not created in this
    // milestone; their getters/UI helpers (getXmlWindow/refreshButton/prepareButton/getButtonImage) are
    // omitted for now — no ported code calls them yet. One documented gap rather than a fan-out of stubs
    // (same approach as HabboHelp's absent-members block). (variablePickerHelper is now created below.)

    // AS3: HabboUserDefinedRoomEvents.as::HabboUserDefinedRoomEvents()
    constructor(context: IContext)
    {
        super(context);
    }

    // AS3: HabboUserDefinedRoomEvents.as::get dependencies()
    // The base Component's dependency-eventListener list attaches to the resolved instance's `events`
    // emitter. Audited per emitter:
    //   - RSE_* : RoomSessionManager emits on `sessionEvents` (not `events`, per rule 20-architecture
    //     #4) → the list never fired; now subscribed on sessionEvents in the resolve callback below.
    //   - HTE_TOOLBAR_CLICK : HabboToolbar emits on `toolbarEvents` → same fix (subscribed below);
    //     its handler (wiredMenu.toggleView) is still a wired_menu-bloc stub, so currently inert.
    //   - REOE_ADDED : RoomEngine DOES emit on `events`, so the list form works — kept as-is.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communication = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localization = manager; }
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (manager: IHabboNotifications | null) => { this._notifications = manager; }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) => { this._roomEngine = engine; },
                true,
                [{ type: 'REOE_ADDED', callback: (e: unknown) => this.roomObjectAddedHandler(e) }]
            ),
            // AS3 registers the RSE_* listeners through the dependency's event-listener list, which the
            // port attaches to the resolved instance's `events` emitter. RoomSessionManager emits RSE_*
            // on `sessionEvents` (the port keeps `events` for the DI system, rule 20-architecture #4),
            // so those listeners never fired and _roomSession stayed null (→ roomId 0). Subscribe on
            // sessionEvents in the resolve callback instead — the same pattern HabboCatalog/HabboInventory use.
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_CREATED, this._onRoomSessionEvent);
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this._onRoomSessionEvent);

                    this._roomSessionManager = manager;

                    manager?.sessionEvents.on(RoomSessionEvent.RSE_CREATED, this._onRoomSessionEvent);
                    manager?.sessionEvents.on(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);
                    manager?.sessionEvents.on(RoomSessionEvent.RSE_ENDED, this._onRoomSessionEvent);
                },
                false
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_RoomUI,
                (ui: IRoomUI | null) => { this._roomUI = ui; },
                false
            ),
            // Same emitter mismatch as RSE_* above: HabboToolbar dispatches TOOLBAR_CLICK on its
            // dedicated `toolbarEvents` emitter, not `events`, so the dependency's event-listener list
            // never fired. Subscribe on toolbarEvents in the resolve callback. (Its handler target,
            // wiredMenu.toggleView(), is still a wired_menu-bloc stub, so this is currently inert — but
            // now correctly wired for when that bloc lands.)
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarEvent);
                    this._toolbar = toolbar;
                    toolbar?.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarEvent);
                },
                false
            )
        ];
    }

    // AS3: HabboUserDefinedRoomEvents.as::initComponent()
    protected override initComponent(): void
    {
        // wiredMenu must exist before WiredEnvironment (which reads wiredMenu permissions).
        this._wiredMenu = new WiredMenuController(this, this.context, 0, this.assets);
        this.context.attachComponent(this._wiredMenu, [IID_WiredMenuController]);

        this._wiredCtrl = new UserDefinedRoomEventsCtrl(this);
        this._wiredEnvironment = new WiredEnvironment(this);
        this._variablePickerHelper = new NewVariablePickerHelper(this);

        // AS3 creates the incoming-message handler here (initComponent), when communication is ready.
        this._incomingMessages = new IncomingMessages(this);

        // AS3: _roomEngine.events.addEventListener('REE_DISPOSED', onRoomEngineEvent)
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);

        this._variablesSynchronizer = new WiredVariablesSynchronizer(this);
        // TODO(AS3): attach the wired-trading controllers — deferred (see the class-level scope note).

        log.debug('HabboUserDefinedRoomEvents initialized (wired_setup spine)');
    }

    // --- Getters ---

    // AS3: HabboUserDefinedRoomEvents.as::get communication()
    get communication(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get localization()
    get localization(): IHabboLocalizationManager
    {
        return this._localization!;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get notifications()
    get notifications(): IHabboNotifications
    {
        return this._notifications!;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get wiredCtrl()
    get wiredCtrl(): IUserDefinedRoomEventsCtrl
    {
        return this._wiredCtrl;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get variablesSynchronizer()
    get variablesSynchronizer(): WiredVariablesSynchronizer
    {
        return this._variablesSynchronizer;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get wiredMenu()
    get wiredMenu(): WiredMenuController
    {
        return this._wiredMenu;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get variablePickerHelper()
    get variablePickerHelper(): NewVariablePickerHelper
    {
        return this._variablePickerHelper;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get roomUI()
    get roomUI(): IRoomUI | null
    {
        return this._roomUI;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get roomId()
    get roomId(): number
    {
        return this._roomSession ? this._roomSession.roomId : 0;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get roomSession()
    get roomSession(): IRoomSession | null
    {
        return this._roomSession;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: HabboUserDefinedRoomEvents.as::set userName()
    set userName(value: string)
    {
        this._userName = value;
    }

    // --- IHabboUserDefinedRoomEvents ---

    // AS3: HabboUserDefinedRoomEvents.as::stuffSelected()
    stuffSelected(id: number): void
    {
        // TODO(AS3): AS3 first checks (roomEngine as IRoomEngine-ext).getPlacedObjectData(roomId): if
        // it holds this furni (data.id == -id) it clears it via setPlacedObjectData(roomId, null) and
        // returns. The port's RoomEngine exposes neither get/setPlacedObjectData yet, so the
        // placed-object early-return is skipped.
        this._wiredCtrl.stuffSelected(id);
        this._wiredMenu.furniSelected(id);
    }

    // AS3: HabboUserDefinedRoomEvents.as::userSelected()
    userSelected(id: number): void
    {
        if(this.hasClickUserWired())
        {
            this.send(new WiredClickUserMessageComposer(id));
        }
        this._wiredMenu.userSelected(id);
    }

    // AS3: HabboUserDefinedRoomEvents.as::showInspectButton()
    showInspectButton(): boolean
    {
        return this._wiredMenu.isEnabled && this._wiredMenu.hasReadPermission && this._wiredMenu.wiredInspectButton;
    }

    // AS3: HabboUserDefinedRoomEvents.as::showToolbarMenuButton()
    showToolbarMenuButton(): boolean
    {
        return this._wiredMenu.isEnabled && this._wiredMenu.hasReadPermission && this._wiredMenu.wiredMenuButton;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get wiredWhisperDisabled()
    get wiredWhisperDisabled(): boolean
    {
        return this._wiredMenu.wiredWhisperDisabled;
    }

    // AS3: HabboUserDefinedRoomEvents.as::set wiredWhisperDisabled()
    set wiredWhisperDisabled(value: boolean)
    {
        this._wiredMenu.wiredWhisperDisabled = value;
    }

    // AS3: HabboUserDefinedRoomEvents.as::hasClickUserWired()
    hasClickUserWired(): boolean
    {
        return this._wiredEnvironment.hasClickUserWired;
    }

    // AS3: HabboUserDefinedRoomEvents.as::get achievementsInRoom()
    get achievementsInRoom(): string[] | null
    {
        return this._wiredEnvironment ? this._wiredEnvironment.achievements : null;
    }

    // AS3: HabboUserDefinedRoomEvents.as::switchPlayTestMode()
    switchPlayTestMode(): void
    {
        this._wiredMenu.setPlayTestMode(!this._wiredMenu.playTestMode, true, true);
    }

    // AS3: HabboUserDefinedRoomEvents.as::resetCache()
    resetCache(): void
    {
        this._wiredCtrl.clearCache();
    }

    // AS3: HabboUserDefinedRoomEvents.as::hasWiredUIOpen()
    hasWiredUIOpen(): boolean
    {
        return this._wiredCtrl.hasUIOpen() || this._wiredMenu.hasUIOpen();
    }

    // AS3: HabboUserDefinedRoomEvents.as::get isGameMode()
    get isGameMode(): boolean
    {
        return this._wiredEnvironment.clickUserOption === 1;
    }

    // AS3: HabboUserDefinedRoomEvents.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    // AS3: HabboUserDefinedRoomEvents.as::getXmlWindow()
    getXmlWindow(name: string): IWindow | null
    {
        try
        {
            // AS3: assets.getAssetByName(name + "_xml") → _windowManager.buildFromXML(content).
            // In this port, window layouts are not held in a per-component asset library; every
            // window-layouts/*.xml is registered once in the window manager's widget-layout registry
            // (App.ts → registerWidgetLayout, keyed by the *Com.as field name, i.e. name + "_xml").
            // buildWidgetLayout(name + "_xml") is the exact equivalent: fetch that stored XML and
            // buildFromXML() a fresh window — the same path ClubCenterView/CatalogPage/etc. use.
            return this.windowManager?.buildWidgetLayout(name + '_xml') ?? null;
        }
        catch (_e)
        {
            return null;
        }
    }

    // AS3: HabboUserDefinedRoomEvents.as::getButtonImage()
    getButtonImage(name: string, suffix: string = '_png'): ImageBitmap | null
    {
        // AS3 resolves a BitmapDataAsset and returns a clone() of its BitmapData; the port's image
        // assets are ImageBitmaps consumed read-only by the caller, so the content is returned directly.
        const asset = this.assets?.getAssetByName(name + suffix);

        return (asset?.content as ImageBitmap | null) ?? null;
    }

    // --- Event handlers ---

    // AS3: HabboUserDefinedRoomEvents.as::roomObjectAddedHandler()
    private roomObjectAddedHandler(event: unknown): void
    {
        // AS3 param is RoomEngineObjectEvent (objectId + category).
        const e = event as { objectId: number; category: number };
        switch(e.category - 10)
        {
            case 0:
                this._wiredCtrl.stuffAdded(e.objectId);
                break;
            case 10:
                this._wiredCtrl.stuffAdded(-e.objectId);
                break;
        }
    }

    // Bound entry point for sessionEvents.on/off (preserves `this`; see the RoomSessionManager
    // dependency). Delegates to the AS3-named handler below.
    private _onRoomSessionEvent = (event: RoomSessionEvent): void =>
    {
        this.roomSessionStateEventHandler(event);
    };

    // AS3: HabboUserDefinedRoomEvents.as::roomSessionStateEventHandler()
    private roomSessionStateEventHandler(event: unknown): void
    {
        if(this._roomEngine == null) return;

        // AS3 param is RoomSessionEvent (type + session).
        const e = event as { type: string; session: IRoomSession };
        switch(e.type)
        {
            case 'RSE_CREATED':
                this._roomSession = e.session;
                break;
            case 'RSE_STARTED':
                this._roomSession = e.session;
                break;
            case 'RSE_ENDED':
                this._roomSession = e.session;
                this._wiredEnvironment.leaveRoom();
                break;
        }
    }

    // AS3: HabboUserDefinedRoomEvents.as::onHabboToolbarEvent()
    // Bound entry point for toolbarEvents.on/off (preserves `this`; see the HabboToolbar dependency).
    private _onToolbarEvent = (event: unknown): void =>
    {
        this.onHabboToolbarEvent(event);
    };

    private onHabboToolbarEvent(event: unknown): void
    {
        // AS3 param is HabboToolbarEvent (type + iconId).
        const e = event as { type: string; iconId: string };
        if(e.type !== 'HTE_TOOLBAR_CLICK') return;
        if(e.iconId === 'HTIE_ICON_WIRED_MENU')
        {
            this._wiredMenu.toggleView();
        }
    }

    // AS3: HabboUserDefinedRoomEvents.as::onRoomEngineEvent()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        const e = event as { type: string } | null;
        if(e == null) return;
        if(e.type === 'REE_DISPOSED')
        {
            // TODO(AS3): also _variablesSynchronizer.clear() and _wiredContractController.clear() once
            // those are ported.
            this._wiredEnvironment.clear();
            this._wiredCtrl.close();
        }
    };

    // AS3: HabboUserDefinedRoomEvents.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_CREATED, this._onRoomSessionEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this._onRoomSessionEvent);
        this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarEvent);

        if(this._incomingMessages != null)
        {
            this._incomingMessages.dispose();
            this._incomingMessages = null;
        }

        if(this._variablesSynchronizer)
        {
            this._variablesSynchronizer.dispose();
        }

        if(this._wiredEnvironment)
        {
            this._wiredEnvironment.dispose();
        }

        // TODO(AS3): dispose _variablesSynchronizer and the wired-trading controllers once ported
        // (deferred — see scope note). _wiredMenu is a DI-attached Component; it is disposed by the
        // context on detach.

        super.dispose();

        log.debug('HabboUserDefinedRoomEvents disposed');
    }
}
