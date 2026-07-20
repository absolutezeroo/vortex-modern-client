import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IMessageComposer} from '@core';
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
import type {IRoomUI} from '@habbo/ui/IRoomUI';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';

import type {IHabboUserDefinedRoomEvents} from './IHabboUserDefinedRoomEvents';
import type {IUserDefinedRoomEventsCtrl} from './wired_setup/IUserDefinedRoomEventsCtrl';
import {UserDefinedRoomEventsCtrl} from './wired_setup/UserDefinedRoomEventsCtrl';
import {WiredMenuController} from './wired_menu/WiredMenuController';
import {WiredEnvironment} from './WiredEnvironment';
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
    private _userName: string = '';

    // Created in initComponent() (see scope note).
    private _wiredCtrl!: UserDefinedRoomEventsCtrl;
    private _wiredMenu!: WiredMenuController;
    private _wiredEnvironment!: WiredEnvironment;

    // TODO(AS3): deferred sub-controllers, all created in the AS3 constructor and exposed via getters
    // (variablesSynchronizer/wiredChest/transactionLogs/transactionDetails/rewardNotificationController/
    // selfDonationTool/transactionDetails/variablePickerHelper) plus the incoming-message handler
    // (_incomingMessages = new IncomingMessages(this)) and the WiredContractController. Not created in
    // this milestone; their getters/UI helpers (getXmlWindow/refreshButton/prepareButton/
    // getButtonImage) are omitted for now — no ported code calls them yet. One documented gap rather
    // than a fan-out of stubs (same approach as HabboHelp's absent-members block).

    // AS3: HabboUserDefinedRoomEvents.as::HabboUserDefinedRoomEvents()
    constructor(context: IContext)
    {
        super(context);
    }

    // AS3: HabboUserDefinedRoomEvents.as::get dependencies()
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
            new ComponentDependency(
                IID_RoomSessionManager,
                null,
                false,
                [
                    { type: 'RSE_CREATED', callback: (e: unknown) => this.roomSessionStateEventHandler(e) },
                    { type: 'RSE_STARTED', callback: (e: unknown) => this.roomSessionStateEventHandler(e) },
                    { type: 'RSE_ENDED', callback: (e: unknown) => this.roomSessionStateEventHandler(e) }
                ]
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
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => { this._toolbar = toolbar; },
                false,
                [{ type: 'HTE_TOOLBAR_CLICK', callback: (e: unknown) => this.onHabboToolbarEvent(e) }]
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

        // AS3: _roomEngine.events.addEventListener('REE_DISPOSED', onRoomEngineEvent)
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);

        // TODO(AS3): create _incomingMessages (IncomingMessages), _variablesSynchronizer
        // (WiredVariablesSynchronizer), and attach the wired-trading controllers — deferred (see the
        // class-level scope note).

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

    // AS3: HabboUserDefinedRoomEvents.as::get wiredMenu()
    get wiredMenu(): WiredMenuController
    {
        return this._wiredMenu;
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

        if(this._wiredEnvironment)
        {
            this._wiredEnvironment.dispose();
        }

        // TODO(AS3): dispose _incomingMessages, _variablesSynchronizer and the wired-trading
        // controllers once ported (deferred — see scope note). _wiredMenu is a DI-attached Component;
        // it is disposed by the context on detach.

        super.dispose();

        log.debug('HabboUserDefinedRoomEvents disposed');
    }
}
