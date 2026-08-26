import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {CraftinRecipeIngredientParser} from './CraftinRecipeIngredientParser';

/**
 * The ingredient list for one crafting recipe, in response to `GetCraftingRecipeComposer`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_4240.as
 * (real name from sources/win63_version/habbo/communication/messages/parser/crafting/CraftingRecipeMessageEventParser.as)
 */
export class CraftingRecipeMessageEventParser implements IMessageParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_4240.as::_SafeStr_7242 (ingredients)
    private _ingredients: CraftinRecipeIngredientParser[] = [];

    // AS3: .../_SafePkg_3516/_SafeCls_4240.as::flush()
    flush(): boolean
    {
        this._ingredients = [];

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4240.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._ingredients.push(new CraftinRecipeIngredientParser(wrapper));
        }

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4240.as::get ingredients()
    get ingredients(): CraftinRecipeIngredientParser[]
    {
        return this._ingredients;
    }
}
