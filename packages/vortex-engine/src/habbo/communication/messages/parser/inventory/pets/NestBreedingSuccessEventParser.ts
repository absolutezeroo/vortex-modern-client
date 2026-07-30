import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A breeding nest hatched (header 40): the new pet's id and the rarity category it came out as.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_4023.as
 * (obfuscated in the primary dump; `_SafeStr_4546[40] = _SafeCls_3668` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1663, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/NestBreedingSuccessEventParser.as).
 */
export class NestBreedingSuccessEventParser implements IMessageParser
{
    private _petId: number = -1;

    private _rarityCategory: number = -1;

    // AS3: .../_SafeCls_4023.as::get petId()
    get petId(): number
    {
        return this._petId;
    }

    // AS3: .../_SafeCls_4023.as::get rarityCategory()
    get rarityCategory(): number
    {
        return this._rarityCategory;
    }

    // AS3: .../_SafeCls_4023.as::flush()
    flush(): boolean
    {
        this._petId = -1;
        this._rarityCategory = -1;

        return true;
    }

    // AS3: .../_SafeCls_4023.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._petId = wrapper.readInt();
        this._rarityCategory = wrapper.readInt();

        return true;
    }
}
