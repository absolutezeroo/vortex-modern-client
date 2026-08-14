import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a page of wired-chest transaction logs — header 2016 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[2016]`).
 *
 * The *page size* is what tells the two consumers apart on the way back: the chests tab asks for 10
 * and the paged transactions window for `TransactionConfig.PAGE_SIZE` (25), and each then checks the
 * reply's `logListType` before using it.
 *
 * **Name DERIVED** — no unobfuscated tree carries this composer and the emulator has no constant
 * for 2016. Named for what it asks.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2407/_SafeCls_2406.as
 */
export class RequestWiredTransactionLogsComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    // AS3: _SafeCls_2406.as::_SafeCls_2406()
    constructor(amount: number, page: number)
    {
        super();

        this._data = [amount, page];
    }

    // AS3: _SafeCls_2406.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
