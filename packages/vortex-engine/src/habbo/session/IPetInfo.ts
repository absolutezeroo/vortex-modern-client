/**
 * Pet info interface
 *
 * @see source_as_win63/habbo/session/IPetInfo.as
 */
export interface IPetInfo
{
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get petId()
    readonly petId: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get level()
    readonly level: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get levelMax()
    readonly levelMax: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get experience()
    readonly experience: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get experienceMax()
    readonly experienceMax: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get energy()
    readonly energy: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get energyMax()
    readonly energyMax: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get nutrition()
    readonly nutrition: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get nutritionMax()
    readonly nutritionMax: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get ownerId()
    readonly ownerId: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get ownerName()
    readonly ownerName: string;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get respect()
    readonly respect: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get age()
    readonly age: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get breedId()
    readonly breedId: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get hasFreeSaddle()
    readonly hasFreeSaddle: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get isRiding()
    readonly isRiding: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get canBreed()
    readonly canBreed: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get canHarvest()
    readonly canHarvest: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get canRevive()
    readonly canRevive: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get rarityLevel()
    readonly rarityLevel: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get skillTresholds()
    readonly skillTresholds: number[];
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get accessRights()
    readonly accessRights: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get maxWellBeingSeconds()
    readonly maxWellBeingSeconds: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get remainingWellBeingSeconds()
    readonly remainingWellBeingSeconds: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get remainingGrowingSeconds()
    readonly remainingGrowingSeconds: number;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get hasBreedingPermission()
    readonly hasBreedingPermission: boolean;
    // AS3: .../src/com/sulake/habbo/session/IPetInfo.as::get adultLevel()
    readonly adultLevel: number;
}
