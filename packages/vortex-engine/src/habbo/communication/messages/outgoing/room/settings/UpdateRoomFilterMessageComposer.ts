import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Add or remove a custom filter word for a room.
 * ADD = true, REMOVE = false.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/roomsettings/UpdateRoomFilterMessageComposer.as
 */
export class UpdateRoomFilterMessageComposer extends MessageComposer<[number, boolean, string]>
{
    static readonly ADD: boolean = true;
    static readonly REMOVE: boolean = false;

    private _data: [number, boolean, string];

    constructor(roomId: number, add: boolean, word: string)
    {
        super();

        this._data = [roomId, add, word];
    }

    getMessageArray(): [number, boolean, string]
    {
        return this._data;
    }
}
