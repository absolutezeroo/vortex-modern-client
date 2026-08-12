import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleAsset} from './CollectibleAsset';

/**
 * The NFT assets on each side of an open trade (header 850): my offer, then theirs.
 *
 * Both lists are a full replacement, not a delta — `TradingModel.updateNftItems()` disposes the
 * previous maps and clears both accept flags on every one of these.
 *
 * Name DERIVED: obfuscated in every tree, named from AS3's handler (`onTradeNfts`) and from the
 * two accessors it keeps (`myItems`/`theirItems`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2726/_SafeCls_2725.as
 */
export class TradeNftAssetsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2725.as::_SafeStr_7429 (from `get myItems()`)
    private _myItems: CollectibleAsset[] = [];

    // AS3: _SafeCls_2725.as::_SafeStr_7048 (from `get theirItems()`)
    private _theirItems: CollectibleAsset[] = [];

    // AS3: _SafeCls_2725.as::get myItems()
    get myItems(): CollectibleAsset[]
    {
        return this._myItems;
    }

    // AS3: _SafeCls_2725.as::get theirItems()
    get theirItems(): CollectibleAsset[]
    {
        return this._theirItems;
    }

    // AS3: _SafeCls_2725.as::flush()
    flush(): boolean
    {
        this._myItems = [];
        this._theirItems = [];

        return true;
    }

    // AS3: _SafeCls_2725.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._myItems = [];

        let count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._myItems.push(new CollectibleAsset(wrapper));

        this._theirItems = [];

        count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._theirItems.push(new CollectibleAsset(wrapper));

        return true;
    }
}
