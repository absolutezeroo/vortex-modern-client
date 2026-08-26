import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests a single recipe's ingredient list, by recipe code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2376/_SafeCls_3392.as
 * (real name from sources/win63_version/habbo/communication/messages/outgoing/crafting/GetCraftingRecipeComposer.as;
 * header 1398 from WIN63's registry)
 */
export class GetCraftingRecipeComposer extends MessageComposer<ConstructorParameters<typeof GetCraftingRecipeComposer>>
{
    private _data: ConstructorParameters<typeof GetCraftingRecipeComposer>;

    constructor(recipeCode: string)
    {
        super();
        this._data = [recipeCode];
    }

    // AS3: .../_SafePkg_2376/_SafeCls_3392.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
