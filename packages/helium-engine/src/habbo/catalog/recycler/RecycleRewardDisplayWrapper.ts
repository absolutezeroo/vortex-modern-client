import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';

/**
 * Adapts a recycler prize's (productItemType, productItemTypeId) pair to the generic
 * product-preview widget's `IProductDisplayInfo` shape.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as
 */
export class RecycleRewardDisplayWrapper implements IProductDisplayInfo
{
    private _productItemType: string;

    private _productItemTypeId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::RecycleRewardDisplayWrapper()
    constructor(productItemType: string, productItemTypeId: number)
    {
        this._productItemType = productItemType;
        this._productItemTypeId = productItemTypeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        switch(this._productItemType)
        {
            case 'chat_style': return 9;
            case 'i': return 0;
            case 's': return 1;
            default: return -1;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return String(this._productItemTypeId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get figureSetIds()
    // AS3 returns `undefined` (Vector.<int> is never populated) - represented here as an empty
    // array since IProductDisplayInfo.figureSetIds is non-nullable.
    get figureSetIds(): number[]
    {
        return [];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/RecycleRewardDisplayWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }
}
