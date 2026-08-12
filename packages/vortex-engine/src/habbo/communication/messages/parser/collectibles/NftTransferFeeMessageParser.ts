import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * What the hotel charges to move NFTs out to an external wallet.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`TransferNftsTab.as::onNftTransferFeeMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4321.as
 */
export class NftTransferFeeMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4321.as::_SafeStr_8004 (from `get transferFee()`)
    private _transferFee: number = 0;

    // AS3: _SafeCls_4321.as::flush()
    flush(): boolean
    {
        this._transferFee = 0;

        return true;
    }

    // AS3: _SafeCls_4321.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._transferFee = wrapper.readInt();

        return true;
    }

    // AS3: _SafeCls_4321.as::get transferFee()
    get transferFee(): number
    {
        return this._transferFee;
    }
}
