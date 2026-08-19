/**
 * OpenRoomTool — wires one button so that clicking it opens a room's moderator card.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenRoomTool.as
 *
 * See `OpenUserInfo` for how the eight action classes in this directory work.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IAlertDialog} from '@habbo/window/utils/AlertDialog';
import type {ModerationManager} from '../ModerationManager';
import {RoomToolCtrl} from '../RoomToolCtrl';

export class OpenRoomTool
{
    // AS3: OpenRoomTool.as::_frame
    private _frame: IFrameWindow | null;

    // AS3: OpenRoomTool.as::_main
    private _main: ModerationManager;

    /** Derived name — `_SafeStr_6722`: the room whose card opens. */
    // AS3: OpenRoomTool.as::_SafeStr_6722
    private _roomId: number;

    // AS3: OpenRoomTool.as::OpenRoomTool()
    constructor(frame: IFrameWindow | null, main: ModerationManager, button: IWindow, roomId: number)
    {
        this._frame = frame;
        this._main = main;
        this._roomId = roomId;

        button.procedure = this.onClick;
    }

    // AS3: OpenRoomTool.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.windowTracker?.show(
            new RoomToolCtrl(this._main, this._roomId), this._frame, false, false, true
        );
    };

    /**
     * Dead in AS3 — declared private and referenced by nothing, in this class or any other. Kept so
     * the member is visible rather than silently dropped; it is never called from here either.
     */
    // AS3: OpenRoomTool.as::onAlertClose()
    private onAlertClose(alert: IAlertDialog): void
    {
        alert.dispose();
    }
}
