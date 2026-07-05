import type {IDisposable} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IUserData} from './IUserData';

/**
 * Interface for user data manager
 * Based on AS3 com.sulake.habbo.session.class_3525 (IUserDataManager)
 */
export interface IUserDataManager extends IDisposable
{
    set connection(connection: IConnection | null);

    /**
	 * Get user data by webID (user type only)
	 */
    getUserData(webId: number): IUserData | null;

    /**
	 * Get user data by webID and type
	 */
    getUserDataByType(webId: number, type: number): IUserData | null;

    /**
	 * Get user data by room object index
	 */
    getUserDataByIndex(roomIndex: number): IUserData | null;

    /**
	 * Get user data by name
	 */
    getUserDataByName(name: string): IUserData | null;

    /**
	 * Get pet user data by webID
	 */
    getPetUserData(webId: number): IUserData | null;

    /**
	 * Get rentable bot user data by webID
	 */
    getRentableBotUserData(webId: number): IUserData | null;

    /**
	 * Get user badges (requests from server if needed)
	 */
    getUserBadges(userId: number): string[];

    /**
	 * Set user data
	 */
    setUserData(userData: IUserData): void;

    /**
	 * Set user badges
	 */
    setUserBadges(userId: number, badges: string[]): void;

    /**
	 * Remove user data by room index
	 */
    removeUserDataByRoomIndex(roomIndex: number): void;

    /**
	 * Update user figure
	 */
    updateFigure(roomIndex: number, figure: string, sex: string, hasSaddle: boolean, isRiding: boolean): void;

    /**
	 * Update pet level
	 */
    updatePetLevel(roomIndex: number, level: number): void;

    /**
	 * Update pet breeding status
	 */
    updatePetBreedingStatus(roomIndex: number, canBreed: boolean, canHarvest: boolean, canRevive: boolean, hasBreedingPermission: boolean): void;

    /**
	 * Update custom data (motto)
	 */
    updateCustom(roomIndex: number, custom: string): void;

    /**
	 * Update achievement score
	 */
    updateAchievementScore(roomIndex: number, score: number): void;

    /**
	 * Update name by room index
	 */
    updateNameByIndex(roomIndex: number, name: string): void;

    /**
	 * Mark user data as blocked/unblocked by room index
	 */
    markAsBlocked(roomIndex: number, blocked?: boolean): void;

    /**
	 * Request pet info from server
	 */
    requestPetInfo(webId: number): void;

    /**
	 * Get all user IDs in the room
	 */
    getAllUserIds(): number[];
}
