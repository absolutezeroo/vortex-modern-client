import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NftClaim} from './NftClaim';

/**
 * Every reward the player has outstanding, for the claims tab.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`RewardClaimsTab.as::onNftClaimsMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4048.as
 */
export class NftClaimsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4048.as::_SafeStr_7145 (from `get nftClaims()`)
    private _nftClaims: NftClaim[] = [];

    // AS3: _SafeCls_4048.as::flush()
    flush(): boolean
    {
        this._nftClaims = [];

        return true;
    }

    // AS3: _SafeCls_4048.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftClaims = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftClaims.push(new NftClaim(wrapper));

        return true;
    }

    // AS3: _SafeCls_4048.as::get nftClaims()
    get nftClaims(): NftClaim[]
    {
        return this._nftClaims;
    }
}
