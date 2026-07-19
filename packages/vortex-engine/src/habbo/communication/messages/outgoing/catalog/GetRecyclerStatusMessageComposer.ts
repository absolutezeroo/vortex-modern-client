import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetRecyclerStatusMessageComposer.as
 */
export class GetRecyclerStatusMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    getMessageArray()
    {
        return this._data;
    }
}
