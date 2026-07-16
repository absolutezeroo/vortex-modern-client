import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single sellable pet palette entry (drives the breed drop-list in PetsCatalogWidget and the
 * colour swatches in NewPetsCatalogWidget).
 *
 * The class *name* is unrecoverable in every available source tree - the primary's `_SafeCls_3976`
 * and `win63_version`'s `class_2908` are the same obfuscated shell carrying a literal
 * `[SecureSWF(rename="true")]` tag. `SellablePetPalette` is a TS-derived name, not a recovered one
 * (same situation, and same handling, as `GuildMembership`). The getters below are not obfuscated
 * in either tree, so those names are real.
 *
 * The primary's copy sits under `src/unknowns/` because its *package* was obfuscated too
 * (`_SafePkg_1714` = "_-H1u"), leaving the decompiler nowhere to place it - not because it is
 * foreign code: it is byte-for-byte the secondary's `class_2908` and is imported directly by the
 * genuine `PetsCatalogWidget.as`/`NewPetsCatalogWidget.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as
 * Names cross-referenced from: sources/win63_version/habbo/communication/messages/parser/catalog/class_2908.as
 */
export class SellablePetPalette
{
    private _type: number = 0;

    private _breedId: number = 0;

    private _paletteId: number = 0;

    private _sellable: boolean = false;

    private _rare: boolean = false;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._type = wrapper.readInt();
        this._breedId = wrapper.readInt();
        this._paletteId = wrapper.readInt();
        this._sellable = wrapper.readBoolean();
        this._rare = wrapper.readBoolean();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as::get breedId()
    get breedId(): number
    {
        return this._breedId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as::get paletteId()
    get paletteId(): number
    {
        return this._paletteId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as::get sellable()
    get sellable(): boolean
    {
        return this._sellable;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3976.as::get rare()
    get rare(): boolean
    {
        return this._rare;
    }
}
