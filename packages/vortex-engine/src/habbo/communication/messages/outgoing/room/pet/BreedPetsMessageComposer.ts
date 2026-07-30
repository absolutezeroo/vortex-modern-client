import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Drives the whole monster-plant breeding negotiation (header 1922): the same composer carries the
 * initial request, the other owner's acceptance and either side's cancellation, distinguished only
 * by its first field.
 *
 * AS3 sends it from AvatarInfoWidget's three entry points — breedPets() with 0, cancelBreedPets()
 * with 1, acceptBreedPets() with 2 — and the server answers with ConfirmBreedingRequestEvent (1477)
 * or NestBreedingSuccessEvent (40).
 *
 * Body is (state, petId1, petId2), all ints.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1910/_SafeCls_2980.as
 * (obfuscated in the primary dump; `_composers[1922] = _SafeCls_2980` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:733, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/room/pets/BreedPetsMessageComposer.as).
 */
export class BreedPetsMessageComposer extends MessageComposer<ConstructorParameters<typeof BreedPetsMessageComposer>>
{
    // AS3: .../BreedPetsMessageComposer.as::const_577
    // Name derived from the call site (AvatarInfoWidget::breedPets() sends 0) — the constant's own
    // identifier is obfuscated in every tree, so only its value is recovered.
    public static readonly STATE_REQUEST: number = 0;

    // AS3: .../BreedPetsMessageComposer.as::const_117
    // Name derived from the call site (AvatarInfoWidget::cancelBreedPets() sends 1).
    public static readonly STATE_CANCEL: number = 1;

    // AS3: .../BreedPetsMessageComposer.as::const_111
    // Name derived from the call site (AvatarInfoWidget::acceptBreedPets() sends 2).
    public static readonly STATE_ACCEPT: number = 2;

    private _data: ConstructorParameters<typeof BreedPetsMessageComposer>;

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/room/pets/BreedPetsMessageComposer.as::BreedPetsMessageComposer()
    constructor(state: number, petId1: number, petId2: number)
    {
        super();
        this._data = [state, petId1, petId2];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/room/pets/BreedPetsMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
