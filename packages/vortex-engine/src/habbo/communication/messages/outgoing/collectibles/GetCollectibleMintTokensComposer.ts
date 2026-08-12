import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks how many mint tokens one wallet holds (WIN63 header 1554).
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3908`), named for its one sender
 * (`MintInventoryListTab.as::set activeWallet()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3908.as
 */
export class GetCollectibleMintTokensComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3908.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_3908.as::_SafeCls_3908()
    constructor(wallet: string)
    {
        super();

        this._data = [wallet];
    }

    // AS3: _SafeCls_3908.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
