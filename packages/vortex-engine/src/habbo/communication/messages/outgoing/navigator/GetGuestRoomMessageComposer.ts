import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get guest room information
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer.as
 */
export class GetGuestRoomMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(roomId: number, enterRoom: boolean, roomForward: boolean)
    {
        super();

        // AS3 pushes booleans as 1 or 0 (ints)
        this._data = [roomId, enterRoom ? 1 : 0, roomForward ? 1 : 0];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
