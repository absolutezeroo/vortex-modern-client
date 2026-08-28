import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One ingredient line of a crafting recipe: how many of a furniture class are needed.
 *
 * Class name (typo included) recovered from
 * `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/crafting/CraftinRecipeIngredientParser.as`
 * (2016: field was `itemName`). The 2026 primary tree kept the shape and renamed the field to
 * `furnitureClassName` — this class follows the primary tree's field and read order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_3886.as
 */
export class CraftinRecipeIngredientParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_3886.as::_count
    private _count: number;

    // AS3: .../_SafePkg_3516/_SafeCls_3886.as::_SafeStr_8042 (furnitureClassName)
    private _furnitureClassName: string;

    // AS3: .../_SafePkg_3516/_SafeCls_3886.as::_SafeCls_3886()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._count = wrapper.readInt();
        this._furnitureClassName = wrapper.readString();
    }

    // AS3: .../_SafePkg_3516/_SafeCls_3886.as::get count()
    get count(): number
    {
        return this._count;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_3886.as::get furnitureClassName()
    get furnitureClassName(): string
    {
        return this._furnitureClassName;
    }
}
