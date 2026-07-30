import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Verdict on a confirmed breeding nest (header 2068): which nest it was, and whether it succeeded.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_2553.as
 * (obfuscated in the primary dump; `_SafeStr_4546[2068] = _SafeCls_2894` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1340, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/ConfirmBreedingResultEventParser.as).
 */
export class ConfirmBreedingResultEventParser implements IMessageParser
{
    private _breedingNestStuffId: number = 0;

    private _result: number = 0;

    // AS3: .../_SafeCls_2553.as::get breedingNestStuffId()
    get breedingNestStuffId(): number
    {
        return this._breedingNestStuffId;
    }

    // AS3: .../_SafeCls_2553.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: .../_SafeCls_2553.as::flush()
    flush(): boolean
    {
        this._breedingNestStuffId = 0;
        this._result = 0;

        return true;
    }

    // AS3: .../_SafeCls_2553.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._breedingNestStuffId = wrapper.readInt();
        this._result = wrapper.readInt();

        return true;
    }
}
