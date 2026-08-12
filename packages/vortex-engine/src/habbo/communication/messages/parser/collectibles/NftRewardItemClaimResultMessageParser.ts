import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether the reward item of a completed collection was successfully claimed to a wallet.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectionView.as::onRewardClaimResult()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4301.as
 */
export class NftRewardItemClaimResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4301.as::_SafeStr_8833 (from `get collectionId()`)
    private _collectionId: string = '';

    // AS3: _SafeCls_4301.as::_SafeStr_8903 (from `get walletAddress()`)
    private _walletAddress: string = '';

    // AS3: _SafeCls_4301.as::_SafeStr_7256 (from `get success()`)
    private _success: boolean = false;

    // AS3: _SafeCls_4301.as::flush()
    flush(): boolean
    {
        this._collectionId = '';
        this._walletAddress = '';
        this._success = false;

        return true;
    }

    // AS3: _SafeCls_4301.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._collectionId = wrapper.readString();
        this._walletAddress = wrapper.readString();
        this._success = wrapper.readBoolean();

        return true;
    }

    // AS3: _SafeCls_4301.as::get collectionId()
    get collectionId(): string
    {
        return this._collectionId;
    }

    // AS3: _SafeCls_4301.as::get walletAddress()
    get walletAddress(): string
    {
        return this._walletAddress;
    }

    // AS3: _SafeCls_4301.as::get success()
    get success(): boolean
    {
        return this._success;
    }
}
