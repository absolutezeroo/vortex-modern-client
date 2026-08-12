import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {CollectibleItem} from '@habbo/communication/messages/parser/collectibles/CollectibleItem';

/**
 * Adapts a collectible product to the preview contract for the *purchase confirmation dialog*.
 *
 * Byte-for-byte the same shape as `BaseItemWrapper` except that it does not implement
 * `IRenderableCollectibleItem` — it has no `amount`, because a product being bought is not a
 * product being held. AS3 keeps them as two classes for that reason and so does this.
 *
 * Its one consumer is `PurchaseConfirmationDialog.as:394`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/RenderableShopNftItem.as
 */
export class RenderableShopNftItem implements IProductDisplayInfo
{
    // AS3: RenderableShopNftItem.as::_SafeStr_4718 (from `get item()`)
    private _item: CollectibleItem;

    // AS3: RenderableShopNftItem.as::RenderableShopNftItem()
    constructor(item: CollectibleItem)
    {
        this._item = item;
    }

    // AS3: RenderableShopNftItem.as::get item()
    get item(): CollectibleItem
    {
        return this._item;
    }

    // AS3: RenderableShopNftItem.as::get productTypeId()
    get productTypeId(): number
    {
        return this._item.productTypeId;
    }

    // AS3: RenderableShopNftItem.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._item.itemTypeId;
    }

    // AS3: RenderableShopNftItem.as::get petFigureString()
    get petFigureString(): string
    {
        return this._item.petFigureString;
    }

    /** Always empty in AS3: a collectible is never a bot. */
    // AS3: RenderableShopNftItem.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }

    // AS3: RenderableShopNftItem.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return this._item.figureSetIds;
    }

    /** Always empty in AS3. */
    // AS3: RenderableShopNftItem.as::get extraData()
    get extraData(): string
    {
        return '';
    }
}
