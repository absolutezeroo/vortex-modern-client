import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Confirms a pending breeding nest (header 2872): the owner has named the offspring and picked which
 * of the two parents' rarity categories to keep.
 *
 * Sent by AvatarInfoWidget::confirmPetBreeding() once ConfirmBreedingRequestEvent (1477) has opened
 * ConfirmPetBreedingView; the server replies with ConfirmBreedingResultEvent (2068).
 *
 * Body is (nestId, name, rarityCategory, petId), i.e. one int, one string, two ints.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3419/_SafeCls_3418.as
 * (obfuscated in the primary dump; `_composers[2872] = _SafeCls_3418` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:878, and
 * the class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/ConfirmPetBreedingComposer.as).
 */
export class ConfirmPetBreedingComposer extends MessageComposer<ConstructorParameters<typeof ConfirmPetBreedingComposer>>
{
    private _data: ConstructorParameters<typeof ConfirmPetBreedingComposer>;

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/ConfirmPetBreedingComposer.as::ConfirmPetBreedingComposer()
    constructor(nestId: number, name: string, rarityCategory: number, petId: number)
    {
        super();
        this._data = [nestId, name, rarityCategory, petId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/pets/ConfirmPetBreedingComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
