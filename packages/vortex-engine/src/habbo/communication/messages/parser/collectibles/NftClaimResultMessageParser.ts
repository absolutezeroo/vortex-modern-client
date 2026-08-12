import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether claiming a reward from the claims tab succeeded.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`RewardClaimsTab.as::onNftClaimResultMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4402.as
 */
export class NftClaimResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4402.as::_SafeStr_6204 (from `get resultCode()`)
    private _resultCode: number = 0;

    // AS3: _SafeCls_4402.as::flush()
    flush(): boolean
    {
        this._resultCode = 0;

        return true;
    }

    // AS3: _SafeCls_4402.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readShort();

        return true;
    }

    // AS3: _SafeCls_4402.as::get success()
    get success(): boolean
    {
        return this._resultCode === 0;
    }

    // AS3: _SafeCls_4402.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }
}
