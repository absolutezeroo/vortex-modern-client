import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the chatlog for a specific room.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetRoomChatlogMessageComposer.as
 */
export class GetRoomChatlogMessageComposer extends MessageComposer<ConstructorParameters<typeof GetRoomChatlogMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetRoomChatlogMessageComposer>;

    /**
     * Parameter names taken from the two call sites — `RoomToolCtrl.onChatlog()` sends
     * `(0, flatId)` and `StartPanelCtrl.onChatlogButton()` sends `(isGuestRoom ? 0 : 1, roomId)`.
     * They previously read `(roomId, unused)`, which had the room id in the wrong slot; nothing
     * called it yet, so nothing was mis-sent.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2384/_SafeCls_2601.as::_SafeCls_2601()
    constructor(roomKind: number, roomId: number)
    {
        super();
        this._data = [roomKind, roomId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/moderator/GetRoomChatlogMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
