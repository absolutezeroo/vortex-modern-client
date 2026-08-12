import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the collector score of one wallet (WIN63 header 1614).
 *
 * Sent whenever the active wallet changes, and only when it is non-null — switching to "no wallet"
 * leaves the previous score on screen rather than clearing it.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_2861`), named for its one sender
 * (`CollectiblesView.as::setActiveWalletIndex()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_2861.as
 */
export class GetCollectorScoreComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_2861.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_2861.as::_SafeCls_2861()
    constructor(wallet: string)
    {
        super();

        this._data = [wallet];
    }

    // AS3: _SafeCls_2861.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
