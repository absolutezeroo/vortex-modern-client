/**
 * PetBreedingResultEventData
 *
 * The widget-side copy of one breeding outcome. AS3 declares it as seven public vars with no
 * constructor arguments, filled in field by field by InfoStandWidgetHandler.onPetBreedingResult().
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/PetBreedingResultEventData.as
 */
export class PetBreedingResultEventData
{
    // AS3: .../PetBreedingResultEventData.as::stuffId
    public stuffId: number = 0;

    // AS3: .../PetBreedingResultEventData.as::classId
    public classId: number = 0;

    // AS3: .../PetBreedingResultEventData.as::productCode
    public productCode: string = '';

    // AS3: .../PetBreedingResultEventData.as::userId
    public userId: number = 0;

    // AS3: .../PetBreedingResultEventData.as::userName
    public userName: string = '';

    // AS3: .../PetBreedingResultEventData.as::rarityLevel
    public rarityLevel: number = 0;

    // AS3: .../PetBreedingResultEventData.as::hasMutation
    public hasMutation: boolean = false;
}
