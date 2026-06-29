import {MessageComposer} from '@core/communication/messages/MessageComposer';

export class RemoveAllRightsMessageComposer extends MessageComposer<[number]>
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
