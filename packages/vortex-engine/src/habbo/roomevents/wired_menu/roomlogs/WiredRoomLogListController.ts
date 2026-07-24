import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';

import {WiredRoomLogsMessageEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredRoomLogsMessageEvent';
import type {WiredRoomLogsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredRoomLogsParser';
import type {WiredLogPage} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredLogPage';
import type {RequestWiredRoomLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomLogsComposer';

import {WiredRoomLogsConfig} from './WiredRoomLogsConfig';
import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {IWiredRoomLogListController} from './IWiredRoomLogListController';
import {WiredRoomLogListView} from './WiredRoomLogListView';

/**
 * WiredRoomLogListController — DI component owning the wired room-logs list window. Registers the
 * log-page incoming handler, drives the WiredRoomLogListView (creating it on first page), and sends
 * paged requests through its own communication manager, tracking an "awaiting page" flag so a
 * user-initiated request resets the view UI while a silent auto-refresh does not.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/roomlogs/WiredRoomLogListController.as
 */
export class WiredRoomLogListController extends Component implements IWiredRoomLogListController
{
    // AS3: WiredRoomLogListController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: WiredRoomLogListController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: WiredRoomLogListController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: WiredRoomLogListController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: WiredRoomLogListController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: WiredRoomLogListController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredRoomLogListController.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: WiredRoomLogListController.as::_SafeStr_4550 (name derived: the room-log list view)
    private _view: WiredRoomLogListView | null = null;

    // AS3: WiredRoomLogListController.as::_SafeStr_4734 (name derived: the current log page)
    private _page: WiredLogPage | null = null;

    // AS3: WiredRoomLogListController.as::_SafeStr_7303 (name derived: awaiting-page flag)
    private _awaitingPage: boolean = false;

    // AS3: WiredRoomLogListController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: WiredRoomLogListController.as::WiredRoomLogListController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
        this._messageEvents = [];
        this._messageEvents.push(new WiredRoomLogsMessageEvent((event) => this.onGetPage(event)));
        // AS3 registers each event here; this port resolves DI dependencies after construction, so the
        // communication manager is still null now and addMessageEvent() would no-op — registration is
        // deferred to initComponent() (same deviation as WiredMenuController).
    }

    // AS3: WiredRoomLogListController.as::get dependencies()
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
            // handler is empty (roomSessionEventHandler does nothing), so it is omitted here as inert.
        ];
    }

    // AS3: WiredRoomLogListController.as::initComponent() — deferred event registration + REE_DISPOSED.
    protected override initComponent(): void
    {
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        // AS3 wires REE_DISPOSED through the RoomEngine dependency's listener list; RoomEngine emits it
        // on `events`, so subscribe there directly (same as WiredMenuController).
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);
    }

    // AS3: WiredRoomLogListController.as::onGetPage()
    private onGetPage(event: IMessageEvent): void
    {
        const page = (event.parser as WiredRoomLogsParser).page;

        if(page.amount !== WiredRoomLogsConfig.PAGE_SIZE)
        {
            return;
        }

        if((this._view == null || !this._view.isShowing()) && !this._awaitingPage)
        {
            return;
        }

        this._page = page;

        if(this._view == null)
        {
            this._view = new WiredRoomLogListView(this, this._windowManager!);
        }

        this._view.displayNewPage(!this._awaitingPage);

        if(!this._view.isShowing())
        {
            this._view.show();
        }

        this._awaitingPage = false;
    }

    // AS3: WiredRoomLogListController.as::send()
    send(composer: RequestWiredRoomLogsComposer, silent: boolean = false): void
    {
        if(!silent)
        {
            this._awaitingPage = true;
        }

        this._communicationManager?.connection?.send(composer);
    }

    // AS3: WiredRoomLogListController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredRoomLogListController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredRoomLogListController.as::roomEventHandler()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        if(this._roomEngine == null)
        {
            return;
        }

        if((event as { type: string }).type === 'REE_DISPOSED')
        {
            if(this._view != null)
            {
                this._view.hide();
            }
        }
    };

    // AS3: WiredRoomLogListController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager
    {
        return this._localizationManager!;
    }

    // AS3: WiredRoomLogListController.as::get page()
    get page(): WiredLogPage | null
    {
        return this._page;
    }

    // AS3: WiredRoomLogListController.as::get view()
    get view(): WiredRoomLogListView | null
    {
        return this._view;
    }

    // AS3: WiredRoomLogListController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: WiredRoomLogListController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

        this._wiredDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineEvent);

        if(this._view != null)
        {
            this._view.dispose();
            this._view = null;
        }

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = null as unknown as IMessageEvent[];
        this._page = null;
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        super.dispose();
    }

    // AS3: WiredRoomLogListController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }
}
