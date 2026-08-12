import type {CollectibleItem} from '@habbo/communication/messages/parser/collectibles/CollectibleItem';
import type {IRenderableCollectibleItem} from '../../IRenderableCollectibleItem';

/**
 * Adapts a bare `CollectibleItem` to the renderer contract, for the cases where there is no
 * ownership behind it — a reward-box drop, a store offer's product.
 *
 * `amount` is hard-coded 0 and `extraData`/`botFigureString` are hard-coded empty; all three are
 * AS3's, not a shortcut. The wrapper describes a product, not a holding, so "how many do I own" has
 * no answer here. Compare `RenderableTradeNftItem` in the inventory, which wraps an owned asset.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/model/BaseItemWrapper.as
 */
export class BaseItemWrapper implements IRenderableCollectibleItem
{
    // AS3: BaseItemWrapper.as::_SafeStr_6567 (from `get baseItem()`)
    private _baseItem: CollectibleItem;

    // AS3: BaseItemWrapper.as::BaseItemWrapper()
    constructor(baseItem: CollectibleItem)
    {
        this._baseItem = baseItem;
    }

    // AS3: BaseItemWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        return this._baseItem.productTypeId;
    }

    // AS3: BaseItemWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._baseItem.itemTypeId;
    }

    // AS3: BaseItemWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return this._baseItem.petFigureString;
    }

    // AS3: BaseItemWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return this._baseItem.figureSetIds;
    }

    // AS3: BaseItemWrapper.as::get baseItem()
    get baseItem(): CollectibleItem
    {
        return this._baseItem;
    }

    /** Always 0 in AS3: this wrapper describes a product, not a holding. */
    // AS3: BaseItemWrapper.as::get amount()
    get amount(): number
    {
        return 0;
    }

    /** Always empty in AS3. */
    // AS3: BaseItemWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    /** Always empty in AS3: a collectible is never a bot. */
    // AS3: BaseItemWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }
}
