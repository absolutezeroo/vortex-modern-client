/**
 * ConfirmPetBreedingPetData
 *
 * The widget-side copy of one breeding parent, filled in field by field by
 * InfoStandWidgetHandler.onConfirmPetBreeding() from the message's own BreedingPetInfo.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/ConfirmPetBreedingPetData.as
 */
export class ConfirmPetBreedingPetData
{
    // AS3: .../ConfirmPetBreedingPetData.as::name
    public name: string = '';

    // AS3: .../ConfirmPetBreedingPetData.as::level
    public level: number = 0;

    // AS3: .../ConfirmPetBreedingPetData.as::figure
    public figure: string = '';

    // AS3: .../ConfirmPetBreedingPetData.as::owner
    public owner: string = '';

    // AS3: .../ConfirmPetBreedingPetData.as::webId
    public webId: number = 0;
}
