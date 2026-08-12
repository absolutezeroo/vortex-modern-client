import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {CollectibleAsset} from '@habbo/communication/messages/parser/collectibles/CollectibleAsset';

/**
 * Adapts a collectible asset to the product-preview contract, so the trade window can draw an NFT
 * with the same widget it uses for furniture.
 *
 * Two of the six members are hard-coded empty rather than forwarded — a collectible has no extra
 * data and is never a bot — and that is AS3's, not a shortcut.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/RenderableTradeNftItem.as
 */
export class RenderableTradeNftItem implements IProductDisplayInfo
{
    // AS3: RenderableTradeNftItem.as::_SafeStr_4718 (from `get item()`)
    private _item: CollectibleAsset;

    // AS3: RenderableTradeNftItem.as::RenderableTradeNftItem()
    constructor(item: CollectibleAsset)
    {
        this._item = item;
    }

    // AS3: RenderableTradeNftItem.as::get item()
    get item(): CollectibleAsset
    {
        return this._item;
    }

    // AS3: RenderableTradeNftItem.as::get productTypeId()
    get productTypeId(): number
    {
        return this._item.productTypeId;
    }

    // AS3: RenderableTradeNftItem.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._item.itemTypeId;
    }

    /** Always empty in AS3: a collectible carries no stuff data to preview. */
    // AS3: RenderableTradeNftItem.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: RenderableTradeNftItem.as::get petFigureString()
    get petFigureString(): string
    {
        return this._item.petFigureString;
    }

    /** Always empty in AS3: a collectible is never a bot. */
    // AS3: RenderableTradeNftItem.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }

    // AS3: RenderableTradeNftItem.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return this._item.figureSetIds;
    }
}
