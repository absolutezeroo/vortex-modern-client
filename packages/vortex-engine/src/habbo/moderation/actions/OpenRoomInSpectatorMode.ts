/**
 * OpenRoomInSpectatorMode — wires one button so that clicking it walks the moderator into the room.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenRoomInSpectatorMode.as
 *
 * Despite the name it does nothing spectator-specific: it calls `ModerationManager.goToRoom()`,
 * which is an ordinary private-room entry. The server decides what a moderator sees once inside.
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ModerationManager} from '../ModerationManager';

export class OpenRoomInSpectatorMode
{
    // AS3: OpenRoomInSpectatorMode.as::_main
    private _main: ModerationManager;

    /** Derived name — `_SafeStr_6722`. */
    // AS3: OpenRoomInSpectatorMode.as::_SafeStr_6722
    private _roomId: number;

    // AS3: OpenRoomInSpectatorMode.as::OpenRoomInSpectatorMode()
    constructor(main: ModerationManager, button: IWindow, roomId: number)
    {
        this._main = main;
        this._roomId = roomId;

        button.procedure = this.onClick;
    }

    // AS3: OpenRoomInSpectatorMode.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.goToRoom(this._roomId);
    };
}
