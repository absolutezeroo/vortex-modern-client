/**
 * BreedPetsResultData — one of the two offspring returned by a finished breeding.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/BreedPetsResultData.as
 *
 * Copied out of RoomWidgetPetBreedingResultEvent by AvatarInfoWidget and handed to
 * BreedPetsResultView, which renders one card per result.
 */
export class BreedPetsResultData
{
    // AS3: BreedPetsResultData.as::stuffId
    public stuffId: number = 0;

    // AS3: BreedPetsResultData.as::classId
    public classId: number = 0;

    // AS3: BreedPetsResultData.as::productCode
    public productCode: string = '';

    // AS3: BreedPetsResultData.as::userId
    public userId: number = 0;

    // AS3: BreedPetsResultData.as::userName
    public userName: string = '';

    // AS3: BreedPetsResultData.as::rarityLevel
    public rarityLevel: number = 0;

    // AS3: BreedPetsResultData.as::hasMutation
    public hasMutation: boolean = false;
}
