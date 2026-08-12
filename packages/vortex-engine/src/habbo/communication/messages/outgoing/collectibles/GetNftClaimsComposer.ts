import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the rewards outstanding on one wallet (WIN63 header 3153).
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3644`), named for its one sender
 * (`RewardClaimsTab.as::processNextRequest()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3644.as
 */
export class GetNftClaimsComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3644.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_3644.as::_SafeCls_3644()
    constructor(wallet: string)
    {
        super();

        this._data = [wallet];
    }

    // AS3: _SafeCls_3644.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
