import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Pet} from '@habbo/inventory/pets/Pet';
import {PetFigureData} from '@habbo/inventory/pets/PetFigureData';

/**
 * A single pet has entered the inventory (header 3653) — bought from the catalog, picked up from a
 * room, or hatched from a breeding nest.
 *
 * The body is one pet record in exactly the layout PetInventoryMessageParser reads per entry, plus a
 * trailing flag telling the client whether to pop the inventory open.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_2868.as
 * (obfuscated in the primary dump; `_SafeStr_4546[3653] = _SafeCls_3510` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1605, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetAddedToInventoryEventParser.as).
 */
export class PetAddedToInventoryEventParser implements IMessageParser
{
    private _pet: Pet | null = null;

    private _openInventory: boolean = false;

    // AS3: .../_SafeCls_2868.as::get pet()
    get pet(): Pet | null
    {
        return this._pet;
    }

    // AS3: .../_SafeCls_2868.as::openInventory()
    // AS3 declares this one as a plain method, not a getter, unlike every other accessor on the
    // parser; kept as a property here since the distinction carries no behaviour.
    get openInventory(): boolean
    {
        return this._openInventory;
    }

    // AS3: .../_SafeCls_2868.as::flush()
    flush(): boolean
    {
        this._pet = null;

        return true;
    }

    // AS3: .../_SafeCls_2868.as::parse()
    // AS3 builds the pet with `new _SafeCls_2577(wrapper)`, the DTO whose constructor reads
    // id/name/PetFigureData/level/rarityLevel; this port keeps that read order inline because its
    // Pet takes its fields explicitly.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const id = wrapper.readInt();
        const name = wrapper.readString();
        const figureData = PetFigureData.parse(wrapper);
        const level = wrapper.readInt();
        const rarityLevel = wrapper.readInt();

        this._pet = new Pet(id, name, figureData, level, rarityLevel);
        this._openInventory = wrapper.readBoolean();

        return true;
    }
}
