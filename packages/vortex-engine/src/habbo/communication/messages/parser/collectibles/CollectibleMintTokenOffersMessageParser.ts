import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {MintTokenOffer} from './MintTokenOffer';

/**
 * The mint-token bundles on sale for silver.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`MintInventoryListTab.as::onMintTokenOffersMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4207.as
 */
export class CollectibleMintTokenOffersMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4207.as::_tokenOffers (from `get tokenOffers()`)
    private _tokenOffers: MintTokenOffer[] = [];

    // AS3: _SafeCls_4207.as::flush()
    flush(): boolean
    {
        this._tokenOffers = [];

        return true;
    }

    // AS3: _SafeCls_4207.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._tokenOffers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._tokenOffers.push(new MintTokenOffer(wrapper));

        return true;
    }

    // AS3: _SafeCls_4207.as::get tokenOffers()
    get tokenOffers(): MintTokenOffer[]
    {
        return this._tokenOffers;
    }
}
