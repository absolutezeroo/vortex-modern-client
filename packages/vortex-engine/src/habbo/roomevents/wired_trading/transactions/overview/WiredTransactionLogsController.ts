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
    WiredTransactionLogsEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogsEvent';
import type {
    WiredTransactionLogsEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionLogsEventParser';
import type {
    WiredTransactionLogList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogList';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import {WiredMenuChestsTab} from '../../../wired_menu/tabs/tab_chests/WiredMenuChestsTab';
import {TransactionConfig} from './TransactionConfig';
import type {IWiredTransactionLogs} from './IWiredTransactionLogs';
import {WiredTransactionLogsView} from './WiredTransactionLogsView';

/**
 * Owns the paged transaction-log window.
 *
 * **Header 2910 answers two windows, and this one filters by page size.** The chests tab's ten-row
 * preview and this window both subscribe; a page of ten is the preview's and is dropped here, and
 * anything that is neither ten nor {@link TransactionConfig.PAGE_SIZE} is dropped as well — so the
 * two tests are a whitelist, not a pair of guards.
 *
 * **Nothing here opens the window.** The request that brings the first page is sent from elsewhere —
 * the chest window's "view logs" button, or the chests tab's "view in detail" — and this shows the
 * window when the answer lands. Subsequent pages are the view's own doing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/overview/WiredTransactionLogsController.as
 */
export class WiredTransactionLogsController extends Component implements IWiredTransactionLogs
{
    // AS3: WiredTransactionLogsController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: WiredTransactionLogsController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: WiredTransactionLogsController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: WiredTransactionLogsController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: WiredTransactionLogsController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: WiredTransactionLogsController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredTransactionLogsController.as::_disposed
    private _controllerDisposed: boolean = false;

    // AS3: WiredTransactionLogsController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: WiredTransactionLogsController.as::_SafeStr_4550 (name derived: the logs window)
    private _view: WiredTransactionLogsView | null = null;

    // AS3: WiredTransactionLogsController.as::_SafeStr_7395 (name derived: the page on screen)
    private _logs: WiredTransactionLogList | null = null;

    // AS3: WiredTransactionLogsController.as::WiredTransactionLogsController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._messageEvents = [new WiredTransactionLogsEvent((event) => this.onLogList(event))];

        // AS3 registers the events here; this port defers to initComponent(), where the
        // communication manager is resolved — the same deviation the sibling controllers make.
    }

    // AS3: WiredTransactionLogsController.as::onLogList()
    private onLogList(event: IMessageEvent): void
    {
        const logs = (event.parser as WiredTransactionLogsEventParser).logs;

        if(logs == null) return;

        if(logs.amount === WiredMenuChestsTab.TRANSACTIONS_PREVIEW_AMOUNT) return;

        if(logs.amount !== TransactionConfig.PAGE_SIZE) return;

        this._logs = logs;

        this._view ??= new WiredTransactionLogsView(this, this._windowManager);
        this._view.displayNewPage();

        if(!this._view.isShowing()) this._view.show();
    }

    // AS3: WiredTransactionLogsController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: WiredTransactionLogsController.as::get dependencies()
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
                (manager: IHabboWindowManager | null) => { this.setWindowManager(manager); }
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

    // AS3: WiredTransactionLogsController.as::initComponent() — deferred registration; AS3 does this in the constructor.
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

    /**
	 * Unlike the chest controller, this only stores the manager — its window is not built until a
	 * page actually arrives.
	 */
    // AS3: WiredTransactionLogsController.as::setWindowManager()
    private setWindowManager(windowManager: IHabboWindowManager | null): void
    {
        this._windowManager = windowManager;
    }

    // AS3: WiredTransactionLogsController.as::roomEventHandler()
    private _onRoomEngineDisposed = (): void =>
    {
        if(this._roomEngine === null) return;

        this._view?.hide();
    };

    // AS3: WiredTransactionLogsController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredTransactionLogsController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredTransactionLogsController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: WiredTransactionLogsController.as::get logs()
    get logs(): WiredTransactionLogList | null
    {
        return this._logs;
    }

    // AS3: WiredTransactionLogsController.as::get view()
    get view(): WiredTransactionLogsView | null
    {
        return this._view;
    }

    // TS-only: no AS3 counterpart; the field exists in AS3 but has no accessor, and this keeps it
    // reachable rather than write-only.
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // TS-only: no AS3 counterpart; same reason as `roomEvents` above.
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: WiredTransactionLogsController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: WiredTransactionLogsController.as::dispose()
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
        this._logs = null;
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;

        super.dispose();
    }
}
