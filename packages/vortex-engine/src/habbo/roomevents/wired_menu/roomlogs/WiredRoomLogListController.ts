import {Component} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {RequestWiredRoomLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomLogsComposer';
import type {IWiredRoomLogListController} from './IWiredRoomLogListController';
import type {WiredRoomLogListView} from './WiredRoomLogListView';

/**
 * WiredRoomLogListController — DI component owning the wired room-logs list (its own window/view,
 * pagination requests, and log-page parser).
 *
 * TODO(AS3): SPINE STUB. The real controller is 237 lines at
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/roomlogs/WiredRoomLogListController.as
 * — it declares the full DI `dependencies` set (comm/session/window/localization/roomEngine/
 * roomSessionManager), registers the WiredLogPage parser (_SafeCls_3729), builds a WiredRoomLogListView
 * on demand, and drives pagination. Only the surface WiredMenuController touches (ctor, send, view,
 * dispose) is wired here; the view creation, message-event registration and page handling are
 * unported. Do not treat the room-logs feature as ported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/roomlogs/WiredRoomLogListController.as
 */
export class WiredRoomLogListController extends Component implements IWiredRoomLogListController
{
    // AS3: WiredRoomLogListController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredRoomLogListController.as::_SafeStr_4550 (name derived: the room-log list view)
    private _view: WiredRoomLogListView | null = null;

    // AS3: WiredRoomLogListController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: WiredRoomLogListController.as::WiredRoomLogListController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
        // TODO(AS3): real ctor pushes `new _SafeCls_3729(onGetPage)` onto _messageEvents and registers
        // it via addMessageEvent — the WiredLogPage response handler (unported).
    }

    // AS3: WiredRoomLogListController.as::send()
    send(composer: RequestWiredRoomLogsComposer, _silent: boolean = false): void
    {
        // TODO(AS3): real send uses this controller's own DI'd communication manager and sets an
        // "awaiting page" flag when !silent. Routed through roomEvents here (same connection).
        this._roomEvents.send(composer);
    }

    // AS3: WiredRoomLogListController.as::get view()
    get view(): WiredRoomLogListView | null
    {
        return this._view;
    }

    // AS3: WiredRoomLogListController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

        this._wiredDisposed = true;

        if(this._view != null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        super.dispose();
    }

    // AS3: WiredRoomLogListController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }
}
