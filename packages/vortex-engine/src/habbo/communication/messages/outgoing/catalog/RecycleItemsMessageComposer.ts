import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/RecycleItemsMessageComposer.as
 */
export class RecycleItemsMessageComposer extends MessageComposer<number[]>
{
    private _data: number[];

    constructor(itemIds: number[])
    {
        super();
        this._data = [itemIds.length, ...itemIds];
    }

    getMessageArray()
    {
        return this._data;
    }
}
