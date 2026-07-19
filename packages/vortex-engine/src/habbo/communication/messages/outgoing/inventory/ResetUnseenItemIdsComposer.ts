import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reset specific unseen items within a category.
 *
 * Header 3771 — distinct from ResetUnseenItemsComposer (699), which resets the whole category and
 * carries only the category id.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3364/_SafeCls_3842.as
 */
export class ResetUnseenItemIdsComposer extends MessageComposer<number[]>
{
    private readonly _data: number[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3364/_SafeCls_3842.as::_SafeCls_3842()
    // AS3 pushes the category, then the count, then concats the ids.
    constructor(category: number, itemIds: number[])
    {
        super();

        this._data = [category, itemIds.length, ...itemIds];
    }

    getMessageArray(): number[]
    {
        return this._data;
    }
}
