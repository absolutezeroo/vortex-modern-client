import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 1999 in WIN63's registry (`_SafeCls_2046.as::_composers[1999]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 1999. Named for its one call site, `WiredChestWrapperView::onViewLogsClick()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3171/_SafeCls_3170.as
 */
export class RequestWiredChestLogsComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    // AS3: _SafeCls_3170.as::constructor
    constructor(amount: number, page: number, chestId: number)
    {
        super();

        this._data = [amount, page, chestId];
    }

    // AS3: _SafeCls_3170.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
