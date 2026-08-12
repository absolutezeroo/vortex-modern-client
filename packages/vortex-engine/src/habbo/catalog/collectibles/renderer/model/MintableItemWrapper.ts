import type {CollectibleProductItem} from '@habbo/communication/messages/parser/collectibles/CollectibleProductItem';
import type {IRenderableCollectibleItem} from '../../IRenderableCollectibleItem';

/**
 * Adapts a mintable furni type to the renderer contract, carrying how many of it the player owns.
 *
 * The only wrapper of the three that *translates* rather than forwards: the parser stores a
 * one-letter item type and the widgets want a numeric product type. Note the mapping is the
 * reverse of what the letters suggest — `"i"` (which the parser derived from wire code 1) becomes
 * product type **0** (wall) and `"s"` (wire code 0) becomes **1** (room/floor). Both AS3's, and both
 * consistent with `CollectiblesController.getProductType()`, where 0 is wall and 1 is room.
 *
 * `amount` has a setter: the mint tab bumps it as the furni inventory changes, without rebuilding
 * the wrapper.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/model/MintableItemWrapper.as
 */
export class MintableItemWrapper implements IRenderableCollectibleItem
{
    // AS3: MintableItemWrapper.as::_SafeStr_8312 (from `get productItem()`)
    private _productItem: CollectibleProductItem;

    // AS3: MintableItemWrapper.as::_amount
    private _amount: number;

    // AS3: MintableItemWrapper.as::MintableItemWrapper()
    constructor(productItem: CollectibleProductItem, amount: number)
    {
        this._productItem = productItem;
        this._amount = amount;
    }

    // AS3: MintableItemWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        switch(this._productItem.itemType)
        {
            case 'i':
                return 0;
            case 's':
                return 1;
            case 'cl':
                return 11;
            default:
                // AS3 returns -1, which no widget branch matches — the icon comes out as the
                // unknown placeholder rather than throwing.
                return -1;
        }
    }

    // AS3: MintableItemWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return String(this._productItem.itemTypeId);
    }

    /** Always empty in AS3. */
    // AS3: MintableItemWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: MintableItemWrapper.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: MintableItemWrapper.as::set amount()
    set amount(value: number)
    {
        this._amount = value;
    }

    /** Always empty in AS3: a mintable furni type carries no pet figure. */
    // AS3: MintableItemWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return '';
    }

    /** Always empty in AS3. */
    // AS3: MintableItemWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }

    // AS3: MintableItemWrapper.as::get productItem()
    get productItem(): CollectibleProductItem
    {
        return this._productItem;
    }

    /** Always empty in AS3: a collectible is never a bot. */
    // AS3: MintableItemWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }
}
