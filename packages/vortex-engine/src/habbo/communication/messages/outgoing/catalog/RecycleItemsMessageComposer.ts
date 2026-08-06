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

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/catalog/RecycleItemsMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
