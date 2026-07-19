/**
 * InfoStandPetData
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetData.as
 *
 * AS3 backs every field with a private var + read-only getter; this port keeps the
 * existing plain-public-field shape used by the sibling InfoStand*Data classes.
 * The field set is AS3's exactly — note it deliberately drops the event's
 * petRespectLeft/hasFreeSaddle/isRiding/canBreed/canHarvest/canRevive, which AS3's
 * setData() does not copy either (petRespectLeft goes to InfoStandUserData instead,
 * see InfoStandWidget.onPetInfo()).
 */
import type {RoomWidgetPetInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPetInfoUpdateEvent';

export class InfoStandPetData
{
    public name: string = '';
    public id: number = -1;
    public type: number = 0;
    public race: number = 0;
    public image: ImageBitmap | null = null;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandPetData.as::setData()
    public setData(event: RoomWidgetPetInfoUpdateEvent): void
    {
        this.name = event.name;
        this.id = event.id;
        this.type = event.petType;
        this.race = event.petRace;
        this.image = event.image;
        this.isOwnPet = event.isOwnPet;
        this.ownerId = event.ownerId;
        this.ownerName = event.ownerName;
        this.canRemovePet = event.canRemovePet;
        this.level = event.level;
        this.levelMax = event.levelMax;
        this.experience = event.experience;
        this.experienceMax = event.experienceMax;
        this.energy = event.energy;
        this.energyMax = event.energyMax;
        this.nutrition = event.nutrition;
        this.nutritionMax = event.nutritionMax;
        this.petRespect = event.petRespect;
        this.roomIndex = event.roomIndex;
        this.age = event.age;
        this.breedId = event.breedId;
        this.skillTresholds = event.skillTresholds;
        this.accessRights = event.accessRights;
        this.maxWellBeingSeconds = event.maxWellBeingSeconds;
        this.remainingWellBeingSeconds = event.remainingWellBeingSeconds;
        this.remainingGrowingSeconds = event.remainingGrowingSeconds;
        this.rarityLevel = event.rarityLevel;
        this.hasBreedingPermission = event.hasBreedingPermission;
    }
}
