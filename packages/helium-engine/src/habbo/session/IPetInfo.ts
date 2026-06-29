/**
 * Pet info interface
 *
 * @see source_as_win63/habbo/session/IPetInfo.as
 */
export interface IPetInfo
{
	readonly petId: number;
	readonly level: number;
	readonly levelMax: number;
	readonly experience: number;
	readonly experienceMax: number;
	readonly energy: number;
	readonly energyMax: number;
	readonly nutrition: number;
	readonly nutritionMax: number;
	readonly ownerId: number;
	readonly ownerName: string;
	readonly respect: number;
	readonly age: number;
	readonly breedId: number;
	readonly hasFreeSaddle: boolean;
	readonly isRiding: boolean;
	readonly canBreed: boolean;
	readonly canHarvest: boolean;
	readonly canRevive: boolean;
	readonly rarityLevel: number;
	readonly skillTresholds: number[];
	readonly accessRights: number;
	readonly maxWellBeingSeconds: number;
	readonly remainingWellBeingSeconds: number;
	readonly remainingGrowingSeconds: number;
	readonly hasBreedingPermission: boolean;
	readonly adultLevel: number;
}
