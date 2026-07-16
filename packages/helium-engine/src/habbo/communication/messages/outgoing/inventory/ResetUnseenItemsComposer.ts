import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reset every unseen item in a category.
 *
 * Header 699. The payload is the category alone — AS3 pushes nothing else. The per-item variant is
 * a separate message, ResetUnseenItemIdsComposer (3771).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3364/_SafeCls_3363.as
 */
export class ResetUnseenItemsComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3364/_SafeCls_3363.as::_SafeCls_3363()
    constructor(category: number)
    {
        super();

        this._data = [category];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
