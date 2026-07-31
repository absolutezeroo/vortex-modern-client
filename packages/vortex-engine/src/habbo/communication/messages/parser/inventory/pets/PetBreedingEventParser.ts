import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Progress of a breeding negotiation between two monster plants (header 939): the same three fields
 * BreedPetsMessageComposer sends, echoed back so both owners' clients can open, update or drop the
 * breeding view.
 *
 * `state` uses BreedPetsMessageComposer's own values (0 request, 1 cancel, 2 accept).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_3802.as
 * (obfuscated in the primary dump; `_SafeStr_4546[939] = _SafeCls_2392` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1754, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/PetBreedingEventParser.as).
 */
export class PetBreedingEventParser implements IMessageParser
{
    private _state: number = 0;

    private _ownPetId: number = 0;

    private _otherPetId: number = 0;

    // AS3: .../_SafeCls_3802.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: .../_SafeCls_3802.as::get ownPetId()
    get ownPetId(): number
    {
        return this._ownPetId;
    }

    // AS3: .../_SafeCls_3802.as::get otherPetId()
    get otherPetId(): number
    {
        return this._otherPetId;
    }

    // AS3: .../_SafeCls_3802.as::flush()
    // AS3's flush() resets nothing at all here; parse() overwrites all three fields unconditionally.
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3802.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._state = wrapper.readInt();
        this._ownPetId = wrapper.readInt();
        this._otherPetId = wrapper.readInt();

        return true;
    }
}
