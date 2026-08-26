import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks whether the given inventory furniture ids match a secret recipe — sent as the mixer grid's
 * contents change.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2376/_SafeCls_2375.as
 * (real name from sources/win63_version/habbo/communication/messages/outgoing/crafting/GetCraftingRecipesAvailableComposer.as;
 * header 1302 from WIN63's registry)
 */
export class GetCraftingRecipesAvailableComposer extends MessageComposer<unknown[]>
{
    private _roomId: number;

    private _furnitureIds: number[];

    constructor(roomId: number, furnitureIds: number[])
    {
        super();
        this._roomId = roomId;
        this._furnitureIds = furnitureIds;
    }

    // AS3: .../_SafePkg_2376/_SafeCls_2375.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        const result: unknown[] = [this._roomId, this._furnitureIds.length];

        for(let i = 0; i < this._furnitureIds.length; i++)
        {
            result.push(this._furnitureIds[i]);
        }

        return result;
    }
}
