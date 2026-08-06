import {MessageComposer} from '@core/communication/messages/MessageComposer';

export class GetFlatControllersMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(roomId: number)
    {
        super();
        this._data = [roomId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/roomsettings/GetFlatControllersMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
