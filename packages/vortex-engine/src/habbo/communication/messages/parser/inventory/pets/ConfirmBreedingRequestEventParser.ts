import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {BreedingPetInfo} from '@habbo/communication/messages/incoming/room/pet/BreedingPetInfo';
import {PetBreedingRarityCategory} from '@habbo/communication/messages/incoming/room/pet/PetBreedingRarityCategory';

/**
 * Both parents have accepted, and the server is asking the nest's owner to name the offspring and
 * pick a rarity outcome (header 1477) — the payload behind ConfirmPetBreedingView.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2554/_SafeCls_3500.as
 * (obfuscated in the primary dump; `_SafeStr_4546[1477] = _SafeCls_2909` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1245, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/pets/ConfirmBreedingRequestEventParser.as,
 * whose parse() carries the `while(0 < count)` decompiler corruption; the primary's correct loop is
 * what is ported here.)
 */
export class ConfirmBreedingRequestEventParser implements IMessageParser
{
    private _nestId: number = 0;

    // AS3: .../src/unknowns/_SafePkg_2554/_SafeCls_3500.as::_pet1
    private _pet1: BreedingPetInfo | null = null;

    // AS3: .../src/unknowns/_SafePkg_2554/_SafeCls_3500.as::_pet2
    private _pet2: BreedingPetInfo | null = null;

    // AS3: .../src/unknowns/_SafePkg_2554/_SafeCls_3500.as::_rarityCategories
    private _rarityCategories: PetBreedingRarityCategory[] = [];

    private _resultPetType: number = 0;

    // AS3: .../_SafeCls_3500.as::get nestId()
    get nestId(): number
    {
        return this._nestId;
    }

    // AS3: .../_SafeCls_3500.as::get pet1()
    get pet1(): BreedingPetInfo | null
    {
        return this._pet1;
    }

    // AS3: .../_SafeCls_3500.as::get pet2()
    get pet2(): BreedingPetInfo | null
    {
        return this._pet2;
    }

    // AS3: .../_SafeCls_3500.as::get rarityCategories()
    get rarityCategories(): PetBreedingRarityCategory[]
    {
        return this._rarityCategories;
    }

    // AS3: .../_SafeCls_3500.as::get resultPetType()
    get resultPetType(): number
    {
        return this._resultPetType;
    }

    // AS3: .../_SafeCls_3500.as::flush()
    flush(): boolean
    {
        this._nestId = 0;

        if(this._pet1)
        {
            this._pet1.dispose();
            this._pet1 = null;
        }

        if(this._pet2)
        {
            this._pet2.dispose();
            this._pet2 = null;
        }

        for(const category of this._rarityCategories)
        {
            category.dispose();
        }

        this._rarityCategories = [];

        return true;
    }

    // AS3: .../_SafeCls_3500.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nestId = wrapper.readInt();
        this._pet1 = new BreedingPetInfo(wrapper);
        this._pet2 = new BreedingPetInfo(wrapper);

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._rarityCategories.push(new PetBreedingRarityCategory(wrapper));
        }

        this._resultPetType = wrapper.readInt();

        return true;
    }
}
