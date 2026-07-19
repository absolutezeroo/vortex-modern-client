import type {Badge} from './Badge';

/**
 * Badge filter types
 */
export const BadgeFilter = {
    ALL: -1,
    INACTIVE: 0,
    ACTIVE: 1,
} as const;

export type BadgeFilterType = typeof BadgeFilter[keyof typeof BadgeFilter];

/**
 * Badge data from server
 */
export interface IBadgeData
{
    badgeId: string;
    slotId: number;
}

/**
 * Interface for BadgesModel
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.BadgesModel (ENGINE only)
 */
export interface IBadgesModel
{
    readonly disposed: boolean;
    readonly maxActiveCount: number;

    dispose(): void;

    /**
	 * Initialize badges from server message
	 */
    initBadges(badges: IBadgeData[], getName: (id: string) => string, getDesc: (id: string) => string): void;

    /**
	 * Update or add a badge
	 */
    updateBadge(badgeId: string, isInUse: boolean, slotId: number, getName: (id: string) => string, getDesc: (id: string) => string): Badge | null;

    /**
	 * Remove a badge
	 */
    removeBadge(badgeId: string): boolean;

    /**
	 * Toggle wearing status
	 * Returns the updated badge if changed, null otherwise
	 */
    toggleBadgeWearing(badgeId: string): Badge | null;

    /**
	 * Get badges by filter
	 */
    getBadges(filter?: BadgeFilterType): Badge[];

    /**
	 * Get badge by ID
	 */
    getBadge(badgeId: string): Badge | null;

    /**
	 * Get badge from active badges by index
	 */
    getBadgeFromActive(index: number): Badge | null;

    /**
	 * Get badge from inactive badges by index
	 */
    getBadgeFromInactive(index: number): Badge | null;

    /**
	 * Get currently selected badge
	 */
    getSelectedBadge(filter?: BadgeFilterType): Badge | null;

    /**
	 * Select a badge by ID
	 */
    setBadgeSelected(badgeId: string): void;

    /**
	 * Force selection if none selected
	 */
    forceSelection(): void;

    /**
	 * Remove all selections
	 */
    removeSelections(): void;

    /**
	 * Reset unseen flags
	 * Returns badge IDs that were marked as unseen
	 */
    resetUnseenItems(): string[];

    /**
	 * Mark badges as unseen based on IDs
	 */
    updateUnseenItems(unseenIds: number[]): void;

    /**
	 * Get IDs of currently active badges for saving
	 */
    getActiveBadgeIds(): string[];

    // AS3: sources/win63_version/habbo/inventory/badges/BadgesModel.as::updateView()
    updateView(): void;
}
