import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Crafts using the mixer's current furniture ids (the "secret recipe" flow).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2376/_SafeCls_2897.as
 * (real name from sources/win63_version/habbo/communication/messages/outgoing/crafting/CraftSecretComposer.as;
 * header 323 from WIN63's registry)
 */
export class CraftSecretComposer extends MessageComposer<unknown[]>
{
    private _roomId: number;

    private _furnitureIds: number[];

    constructor(roomId: number, furnitureIds: number[])
    {
        super();
        this._roomId = roomId;
        this._furnitureIds = furnitureIds;
    }

    // AS3: .../_SafePkg_2376/_SafeCls_2897.as::getMessageArray()
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
