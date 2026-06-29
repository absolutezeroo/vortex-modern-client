import type {IFurniModel} from './furni/IFurniModel';
import type {IBadgesModel} from './badges/IBadgesModel';
import type {IEffectsModel} from './effects/IEffectsModel';
import type {IPetsModel} from './pets/IPetsModel';
import type {IBotsModel} from './bots/IBotsModel';
import type {ITradingModel} from './trading/ITradingModel';
import type {IPurse} from './purse/IPurse';
import type {UnseenItemTracker} from './UnseenItemTracker';

/**
 * Inventory categories
 */
export const InventoryCategory = {
	FURNI: 'furni',
	RENTABLES: 'rentables',
	BADGES: 'badges',
	EFFECTS: 'effects',
	PETS: 'pets',
	BOTS: 'bots',
	TRADING: 'trading',
} as const;

export type InventoryCategoryType = typeof InventoryCategory[keyof typeof InventoryCategory];

/**
 * Interface for HabboInventory controller
 *
 * Based on AS3 com.sulake.habbo.inventory.HabboInventory (ENGINE only)
 */
export interface IHabboInventory
{
	readonly isInitialized: boolean;
	readonly currentCategory: InventoryCategoryType | null;

	// Models
	readonly furniModel: IFurniModel;
	readonly badgesModel: IBadgesModel;
	readonly effectsModel: IEffectsModel;
	readonly petsModel: IPetsModel;
	readonly botsModel: IBotsModel;
	readonly tradingModel: ITradingModel;

	// Purse & Tracking
	readonly purse: IPurse;
	readonly unseenItemTracker: UnseenItemTracker;

	// Room session state
	hasRoomSession: boolean;

	/**
	 * Initialize all models
	 */
	init(): void;

	/**
	 * Switch to a category
	 */
	switchCategory(category: InventoryCategoryType): void;

	/**
	 * Mark a category as initialized
	 */
	setCategoryInitialized(category: string): boolean;

	/**
	 * Check if category is initialized
	 */
	isCategoryInitialized(category: string): boolean;

	/**
	 * Update club/subscription status
	 */
	setClubStatus(
		periods: number,
		days: number,
		hasEverBeenMember: boolean,
		isVIP: boolean,
		isExpiring: boolean,
		citizenshipVipIsExpiring: boolean,
		minutesUntilExpiration: number,
		minutesSinceLastModified: number
	): void;

	/**
	 * Request furniture inventory from server
	 */
	requestFurni(): void;

	/**
	 * Request badges from server
	 */
	requestBadges(): void;

	/**
	 * Request pets from server
	 */
	requestPets(): void;

	/**
	 * Request bots from server
	 */
	requestBots(): void;
}
