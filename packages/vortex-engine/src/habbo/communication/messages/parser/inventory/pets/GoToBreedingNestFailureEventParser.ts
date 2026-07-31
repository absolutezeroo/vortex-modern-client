import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A monster plant could not walk to its breeding nest (header 2441). The single `reason` code both
 * selects the localised message ("gotobreedingnestfailure.message.<reason>") and, when it is 6,
 * switches the alert's action button from "get a nest" to "get food".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_3797.as
 * (obfuscated in the primary dump; `_SafeStr_4546[2441] = _SafeCls_3355` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1401, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/GoToBreedingNestFailureEventParser.as).
 */
export class GoToBreedingNestFailureEventParser implements IMessageParser
{
    private _reason: number = 0;

    // AS3: .../_SafeCls_3797.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: .../_SafeCls_3797.as::flush()
    // AS3's flush() resets nothing; parse() overwrites the only field unconditionally.
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3797.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._reason = wrapper.readInt();

        return true;
    }
}
