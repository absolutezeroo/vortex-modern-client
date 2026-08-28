import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One recipe/product pairing: a craftable product's recipe code, product code and the furniture
 * class it produces. Shared by `CraftableProductsMessageEventParser` (the craftable-products list)
 * and `CraftingResultMessageEventParser` (the finished item).
 *
 * Class name recovered from `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/crafting/CraftingResultObjectParser.as`
 * (2016: `recipeName`/`itemName` only). The 2026 primary tree kept the shape but renamed the two
 * fields and added `productCode` — this class follows the primary tree's fields and read order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_3515.as
 */
export class CraftingResultObjectParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::_recipeCode
    private _recipeCode: string;

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::_productCode
    private _productCode: string;

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::_SafeStr_8042 (furnitureClassName)
    private _furnitureClassName: string;

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::_SafeCls_3515()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._recipeCode = wrapper.readString();
        this._productCode = wrapper.readString();
        this._furnitureClassName = wrapper.readString();
    }

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::get recipeCode()
    get recipeCode(): string
    {
        return this._recipeCode;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_3515.as::get furnitureClassName()
    get furnitureClassName(): string
    {
        return this._furnitureClassName;
    }
}
