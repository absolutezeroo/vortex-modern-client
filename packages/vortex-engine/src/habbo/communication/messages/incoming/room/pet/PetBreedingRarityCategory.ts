import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One selectable rarity outcome of a breeding nest: the chance of getting it, and the breed ids it
 * can produce. ConfirmBreedingRequestEvent (1477) carries a list of these, and the index the owner
 * picks is what ConfirmPetBreedingComposer sends back as `rarityCategory`.
 *
 * The class name is this port's — AS3 obfuscates it in every tree (`_SafeCls_4077` in the primary,
 * `class_3889` in the secondary) — but `chance` and `breeds` are the AS3 getters' own names.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4077.as
 * (= sources/win63_version/habbo/communication/messages/incoming/room/pets/class_3889.as, whose
 * constructor carries the `while(0 < count)` decompiler corruption — an index incremented but never
 * compared. The primary dump has the correct loop, which is what is ported here.)
 */
export class PetBreedingRarityCategory
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4077.as::_SafeCls_4077()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._chance = wrapper.readInt();
        this._breeds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._breeds.push(wrapper.readInt());
        }
    }

    private _chance: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4077.as::get chance()
    get chance(): number
    {
        return this._chance;
    }

    private _breeds: number[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4077.as::get breeds()
    get breeds(): number[]
    {
        return this._breeds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1735/_SafeCls_4077.as::dispose()
    dispose(): void
    {
        this._chance = -1;
        this._breeds = [];
    }
}
