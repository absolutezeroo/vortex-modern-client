import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CollectibleAsset} from './CollectibleAsset';

/**
 * Every NFT asset the player owns (header 2247) — the collectibles tab's whole inventory.
 *
 * Answers `RequestNftAssetsComposer` (header 1646) and lands in
 * `HabboInventory.onCollectibles()`, which keys the assets by `assetId` and hands them to
 * `CollectiblesModel.initCollectibles()`.
 *
 * Name DERIVED: obfuscated in every tree, named from the composer it answers and from AS3's own
 * handler name (`onCollectibles`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2726/_SafeCls_3182.as
 */
export class NftAssetsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3182.as::_items
    private _items: CollectibleAsset[] = [];

    // AS3: _SafeCls_3182.as::get items()
    get items(): CollectibleAsset[]
    {
        return this._items;
    }

    // AS3: _SafeCls_3182.as::flush()
    flush(): boolean
    {
        this._items = [];

        return true;
    }

    // AS3: _SafeCls_3182.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._items = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._items.push(new CollectibleAsset(wrapper));

        return true;
    }
}
