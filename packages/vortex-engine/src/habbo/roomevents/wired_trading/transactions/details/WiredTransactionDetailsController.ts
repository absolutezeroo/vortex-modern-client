import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {
    WiredTransactionDetailsMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionDetailsMessageEvent';
import type {
    WiredTransactionDetailsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionDetailsMessageParser';
import type {
    WiredTransactionDetails
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionDetails';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IWiredTransactionDetails} from './IWiredTransactionDetails';
import {WiredTransactionDetailsView} from './WiredTransactionDetailsView';

/**
 * Owns the "what was actually in this transaction" window.
 *
 * **It has no request of its own.** 475 is sent from the log row that was clicked
 * (`TransactionTableObject::onClickDetails()`); this only listens for 1306 and shows whatever comes
 * back, with no id to match against because a click always supersedes the last one.
 *
 * The window is built on first payload and reused, which is why the view is nulled only on dispose.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/details/WiredTransactionDetailsController.as
 */
export class WiredTransactionDetailsController extends Component implements IWiredTransactionDetails
{
    // AS3: WiredTransactionDetailsController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: WiredTransactionDetailsController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: WiredTransactionDetailsController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: WiredTransactionDetailsController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: WiredTransactionDetailsController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: WiredTransactionDetailsController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredTransactionDetailsController.as::_disposed
    private _controllerDisposed: boolean = false;

    // AS3: WiredTransactionDetailsController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: WiredTransactionDetailsController.as::_SafeStr_4550 (name derived: the details window)
    private _view: WiredTransactionDetailsView | null = null;

    // AS3: WiredTransactionDetailsController.as::_details
    private _details: WiredTransactionDetails | null = null;

    // AS3: WiredTransactionDetailsController.as::WiredTransactionDetailsController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._messageEvents = [new WiredTransactionDetailsMessageEvent((event) => this.onTransactionDetails(event))];

        // AS3 registers the events here; this port defers to initComponent(), where the
        // communication manager is resolved — the same deviation the sibling controllers make.
    }

    // AS3: WiredTransactionDetailsController.as::onTransactionDetails()
    private onTransactionDetails(event: IMessageEvent): void
    {
        this._details = (event.parser as WiredTransactionDetailsMessageParser).details;

        this._view ??= new WiredTransactionDetailsView(this, this._windowManager);
        this._view.updateUI();

        if(!this._view.isShowing()) this._view.show();
    }

    // AS3: WiredTransactionDetailsController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: WiredTransactionDetailsController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) => { this._roomEngine = engine; },
                false
            )
            // AS3 also depends on IIDHabboRoomSessionManager with an RSE_STARTED listener, but that
            // handler is empty, so it is omitted here as inert — same call as its siblings.
        ];
    }

    // AS3: WiredTransactionDetailsController.as::initComponent() — deferred registration; AS3 does this in the constructor.
    protected override initComponent(): void
    {
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        // AS3 wires REE_DISPOSED through the RoomEngine dependency's listener list; RoomEngine emits
        // it on `events`, so subscribe there directly (same as the sibling controllers).
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineDisposed);
    }

    // AS3: WiredTransactionDetailsController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredTransactionDetailsController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredTransactionDetailsController.as::roomEventHandler()
    private _onRoomEngineDisposed = (): void =>
    {
        if(this._roomEngine === null) return;

        this._view?.hide();
    };

    // AS3: WiredTransactionDetailsController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: WiredTransactionDetailsController.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: WiredTransactionDetailsController.as::get details()
    get details(): WiredTransactionDetails | null
    {
        return this._details;
    }

    // AS3: WiredTransactionDetailsController.as::get view()
    get view(): WiredTransactionDetailsView | null
    {
        return this._view;
    }

    // TS-only: no AS3 counterpart; the details view reads `roomEvents` nowhere, but the field exists
    // in AS3 and this keeps it reachable rather than write-only.
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: WiredTransactionDetailsController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: WiredTransactionDetailsController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed)
        {
            return;
        }

        this._controllerDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineDisposed);

        this._view?.dispose();
        this._view = null;

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = [];
        this._details = null;
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;

        super.dispose();
    }
}
