/**
 * InfoStandPetData
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandPetData.as
 */
export class InfoStandPetData
{
    public name: string = '';
    public id: number = -1;
    public type: number = 0;
    public race: number = 0;
    public image: unknown = null;
    public isOwnPet: boolean = false;
    public ownerId: number = 0;
    public ownerName: string = '';
    public canRemovePet: boolean = false;
    public age: number = 0;
    public breedId: number = 0;
    public skillTresholds: number[] = [];
    public accessRights: number = 0;
    public level: number = 0;
    public levelMax: number = 0;
    public experience: number = 0;
    public experienceMax: number = 0;
    public energy: number = 0;
    public energyMax: number = 0;
    public nutrition: number = 0;
    public nutritionMax: number = 0;
    public petRespect: number = 0;
    public roomIndex: number = 0;
    public rarityLevel: number = 0;
    public maxWellBeingSeconds: number = 0;
    public remainingWellBeingSeconds: number = 0;
    public remainingGrowingSeconds: number = 0;
    public hasBreedingPermission: boolean = false;

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandPetData.as::setData()
    // TODO(AS3): param is RoomWidgetPetInfoUpdateEvent (not yet ported — out of scope
    // for the furni-only infostand port, see InfoStandPetView.ts).
    public setData(_event: unknown): void
    {
    }
}
