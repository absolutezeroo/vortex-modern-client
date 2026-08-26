import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {CraftingResultObjectParser} from './CraftingResultObjectParser';

/**
 * The list of products the crafting gizmo can currently produce, plus which inventory furniture
 * classes it can consume — the two grids `CraftingWidget.showCraftingCategories()` populates.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_4350.as
 * (real name from sources/win63_version/habbo/communication/messages/parser/crafting/CraftableProductsMessageEventParser.as)
 */
export class CraftableProductsMessageEventParser implements IMessageParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::_SafeStr_6614 (recipeProductItems)
    private _recipeProductItems: CraftingResultObjectParser[] = [];

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::_SafeStr_6578 (usableInventoryFurniClasses)
    private _usableInventoryFurniClasses: string[] = [];

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::flush()
    flush(): boolean
    {
        this._recipeProductItems = [];
        this._usableInventoryFurniClasses = [];

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const recipeCount = wrapper.readInt();

        for(let i = 0; i < recipeCount; i++)
        {
            this._recipeProductItems.push(new CraftingResultObjectParser(wrapper));
        }

        const furniClassCount = wrapper.readInt();

        for(let i = 0; i < furniClassCount; i++)
        {
            this._usableInventoryFurniClasses.push(wrapper.readString());
        }

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::get recipeProductItems()
    get recipeProductItems(): CraftingResultObjectParser[]
    {
        return this._recipeProductItems;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::get usableInventoryFurniClasses()
    get usableInventoryFurniClasses(): string[]
    {
        return this._usableInventoryFurniClasses;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4350.as::hasData()
    hasData(): boolean
    {
        return this._recipeProductItems.length > 0 || this._usableInventoryFurniClasses.length > 0;
    }
}
