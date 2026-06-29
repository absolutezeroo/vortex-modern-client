/**
 * Interface for room user data
 * Based on AS3 com.sulake.habbo.session.class_3490 (IUserData)
 */
export interface IUserData
{
	// Room object identification
	readonly roomObjectId: number;
	readonly type: number;
	readonly webID: number;

	// User information
	name: string;
	figure: string;
	sex: string;
	custom: string;
	achievementScore: number;

	// Group information
	groupID: string;
	groupName: string;
	groupStatus: number;

	// Owner information (for pets/bots)
	ownerId: number;
	ownerName: string;

	// Pet properties
	petLevel: number;
	rarityLevel: number;
	hasSaddle: boolean;
	isRiding: boolean;
	canBreed: boolean;
	canHarvest: boolean;
	canRevive: boolean;
	hasBreedingPermission: boolean;

	// Bot properties
	botSkills: number[];
	botSkillData: unknown[];

	// Moderation
	isModerator: boolean;
	isBlocked: boolean;
}
