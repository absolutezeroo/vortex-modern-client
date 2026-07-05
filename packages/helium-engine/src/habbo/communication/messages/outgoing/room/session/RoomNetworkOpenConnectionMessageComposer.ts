import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Open a room connection via network (for room forwarding).
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/session/RoomNetworkOpenConnectionMessageComposer.as
 */
export class RoomNetworkOpenConnectionMessageComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    constructor(roomId: number, homeRoomId: number)
    {
        super();
        this._data = [roomId, homeRoomId];
    }

    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
