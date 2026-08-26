import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Answers `GetCraftingRecipesAvailableComposer`: how many secret recipes match the furniture
 * currently sitting in the mixer, and whether the mixer's own selected recipe is complete.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_4174.as
 * (real name from sources/win63_version/habbo/communication/messages/parser/crafting/CraftingRecipesAvailableMessageEventParser.as)
 */
export class CraftingRecipesAvailableMessageEventParser implements IMessageParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::_count
    private _count: number = 0;

    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::_SafeStr_8315 (recipeComplete)
    private _recipeComplete: boolean = false;

    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::flush()
    flush(): boolean
    {
        this._count = 0;
        this._recipeComplete = false;

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._count = wrapper.readInt();
        this._recipeComplete = wrapper.readBoolean();

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::get count()
    get count(): number
    {
        return this._count;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4174.as::get recipeComplete()
    get recipeComplete(): boolean
    {
        return this._recipeComplete;
    }
}
