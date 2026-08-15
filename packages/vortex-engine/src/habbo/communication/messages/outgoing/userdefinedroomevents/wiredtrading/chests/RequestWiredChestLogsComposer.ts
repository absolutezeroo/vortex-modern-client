import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * A page of one chest's transaction log — header 1999 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1999]`).
 *
 * The chest id comes **first**, then the page size, then the 1-based page. Its sibling
 * `RequestWiredTransactionLogsComposer` (2016) is the same request without a chest — every log in
 * the room — and drops the leading id, so the two differ by that field alone.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 1999. Named for its two call sites, `WiredChestWrapperView::onViewLogsClick()` and
 * `WiredTransactionLogsView::requestPage()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3171/_SafeCls_3170.as
 */
export class RequestWiredChestLogsComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    // AS3: _SafeCls_3170.as::_SafeCls_3170()
    constructor(chestId: number, amount: number, page: number)
    {
        super();

        this._data = [chestId, amount, page];
    }

    // AS3: _SafeCls_3170.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
