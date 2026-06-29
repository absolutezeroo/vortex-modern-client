import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the current custom filter word list for a room.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/roomsettings/GetCustomRoomFilterMessageComposer.as
 */
export class GetCustomRoomFilterMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(roomId: number)
    {
        super();

        this._data = [roomId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
