import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Abandons a pending breeding nest (header 3367), sent by AvatarInfoWidget::cancelPetBreeding() when
 * the owner dismisses ConfirmPetBreedingView instead of naming the offspring.
 *
 * Body is a single int (the nest id).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3419/_SafeCls_3504.as
 * (obfuscated in the primary dump; `_composers[3367] = _SafeCls_3504` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:962, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/CancelPetBreedingComposer.as).
 */
export class CancelPetBreedingComposer extends MessageComposer<ConstructorParameters<typeof CancelPetBreedingComposer>>
{
    private _data: ConstructorParameters<typeof CancelPetBreedingComposer>;

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/CancelPetBreedingComposer.as::CancelPetBreedingComposer()
    constructor(nestId: number)
    {
        super();
        this._data = [nestId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/CancelPetBreedingComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
