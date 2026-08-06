import {MessageComposer} from '@core/communication/messages/MessageComposer';

export class UnbanUserFromRoomMessageComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    constructor(userId: number, roomId: number)
    {
        super();
        this._data = [userId, roomId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/room/action/UnbanUserFromRoomMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
