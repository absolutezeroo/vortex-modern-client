import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Advances a wired trade one stage (WIN63 header 2818).
 *
 * The single boolean is which stage: `false` accepts and starts the countdown, `true` confirms
 * once the countdown has run out. Both come from the same composer, so sending the wrong flag
 * skips or repeats a stage rather than failing.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3485`), named for
 * `WiredTradingModel.requestAccept()`, the first of its two senders.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3044/_SafeCls_3485.as
 */
export class WiredTradeAcceptComposer extends MessageComposer<[boolean]>
{
    // AS3: _SafeCls_3485.as::_SafeStr_4642 (the composer payload array)
    private _data: [boolean];

    // AS3: _SafeCls_3485.as::_SafeCls_3485()
    constructor(confirm: boolean)
    {
        super();

        this._data = [confirm];
    }

    // AS3: _SafeCls_3485.as::getMessageArray()
    getMessageArray(): [boolean]
    {
        return this._data;
    }
}
