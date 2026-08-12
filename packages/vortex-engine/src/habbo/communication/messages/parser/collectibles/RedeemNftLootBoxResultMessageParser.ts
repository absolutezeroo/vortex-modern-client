import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * How opening an NFT reward box ended: fine, failed, or sent to a wallet that is not Stardust.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectiblesController.as::onRedeemLootBoxResultEvent()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_3421.as
 */
export class RedeemNftLootBoxResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3421.as::_SafeStr_6204 (from `get resultCode()`)
    private _resultCode: number = 0;

    // AS3: _SafeCls_3421.as::flush()
    flush(): boolean
    {
        this._resultCode = 0;

        return true;
    }

    // AS3: _SafeCls_3421.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readShort();

        return true;
    }

    // AS3: _SafeCls_3421.as::get success()
    get success(): boolean
    {
        return this._resultCode === 0;
    }

    // AS3: _SafeCls_3421.as::get fail()
    get fail(): boolean
    {
        return this._resultCode === 1;
    }

    // AS3: _SafeCls_3421.as::get notInStarDustWallet()
    get notInStarDustWallet(): boolean
    {
        return this._resultCode === 2;
    }

    // AS3: _SafeCls_3421.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }
}
