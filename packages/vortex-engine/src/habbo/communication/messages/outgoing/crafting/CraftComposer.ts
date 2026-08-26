import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Crafts the currently-shown public recipe (`CraftingWidget`'s "product" flow, not the mixer).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2376/_SafeCls_2381.as
 * (real name from sources/win63_version/habbo/communication/messages/outgoing/crafting/CraftComposer.as;
 * header 3274 from WIN63's registry)
 */
export class CraftComposer extends MessageComposer<ConstructorParameters<typeof CraftComposer>>
{
    private _data: ConstructorParameters<typeof CraftComposer>;

    constructor(roomId: number, recipeCode: string)
    {
        super();
        this._data = [roomId, recipeCode];
    }

    // AS3: .../_SafePkg_2376/_SafeCls_2381.as::getMessageArray()
    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
