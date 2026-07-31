import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A pet has left the inventory (header 3013) — placed in a room, traded away or deleted.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_3370.as
 * (obfuscated in the primary dump; `_SafeStr_4546[3013] = _SafeCls_2397` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1499, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetRemovedFromInventoryEventParser.as).
 */
export class PetRemovedFromInventoryEventParser implements IMessageParser
{
    private _petId: number = 0;

    // AS3: .../_SafeCls_3370.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../_SafeCls_3370.as::flush()
    // AS3's flush() resets nothing; parse() overwrites the only field unconditionally.
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3370.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petId = wrapper.readInt();

        return true;
    }
}
