import type {CollectibleCollectionItem} from '@habbo/communication/messages/parser/collectibles/CollectibleCollectionItem';
import type {IRenderableCollectibleItem} from '../../IRenderableCollectibleItem';

/**
 * Adapts one slot of a collection to the renderer contract.
 *
 * Unlike `BaseItemWrapper`, `amount` is real here — it is the count the server sent for this slot,
 * and 0 is what greys an uncollected cell out.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/model/CollectionItemWrapper.as
 */
export class CollectionItemWrapper implements IRenderableCollectibleItem
{
    // AS3: CollectionItemWrapper.as::_SafeStr_6432 (from `get collectionItem()`)
    private _collectionItem: CollectibleCollectionItem;

    // AS3: CollectionItemWrapper.as::CollectionItemWrapper()
    constructor(collectionItem: CollectibleCollectionItem)
    {
        this._collectionItem = collectionItem;
    }

    // AS3: CollectionItemWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        return this._collectionItem.productTypeId;
    }

    // AS3: CollectionItemWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._collectionItem.itemTypeId;
    }

    /** Always empty in AS3. */
    // AS3: CollectionItemWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: CollectionItemWrapper.as::get amount()
    get amount(): number
    {
        return this._collectionItem.amount;
    }

    // AS3: CollectionItemWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return this._collectionItem.petFigureString;
    }

    // AS3: CollectionItemWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return this._collectionItem.figureSetIds;
    }

    // AS3: CollectionItemWrapper.as::get collectionItem()
    get collectionItem(): CollectibleCollectionItem
    {
        return this._collectionItem;
    }

    /** Always empty in AS3: a collectible is never a bot. */
    // AS3: CollectionItemWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }
}
