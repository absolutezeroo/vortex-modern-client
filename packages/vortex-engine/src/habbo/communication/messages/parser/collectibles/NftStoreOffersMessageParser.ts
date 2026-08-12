import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NftStoreOffer} from './NftStoreOffer';

/**
 * Everything on sale in the NFT store.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`ShopTab.as::onNftStoreOffers()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4058.as
 */
export class NftStoreOffersMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4058.as::_SafeStr_7024 (from `get nftStoreOffers()`)
    private _nftStoreOffers: NftStoreOffer[] = [];

    // AS3: _SafeCls_4058.as::flush()
    flush(): boolean
    {
        this._nftStoreOffers = [];

        return true;
    }

    // AS3: _SafeCls_4058.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftStoreOffers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftStoreOffers.push(new NftStoreOffer(wrapper));

        return true;
    }

    // AS3: _SafeCls_4058.as::get nftStoreOffers()
    get nftStoreOffers(): NftStoreOffer[]
    {
        return this._nftStoreOffers;
    }
}
