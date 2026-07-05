import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reset unseen items for a category
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/notifications/ResetUnseenItemsComposer.as
 */
export class ResetUnseenItemsComposer extends MessageComposer<ConstructorParameters<typeof ResetUnseenItemsComposer>>
{
    private _data: ConstructorParameters<typeof ResetUnseenItemsComposer>;

    constructor(category: number, ...itemIds: number[])
    {
        super();

        this._data = [category, itemIds.length, ...itemIds];
    }

    getMessageArray()
    {
        return this._data;
    }
}
