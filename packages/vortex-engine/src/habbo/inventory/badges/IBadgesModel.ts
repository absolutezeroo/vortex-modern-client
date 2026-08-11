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
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get badgeCode()
    badgeId: string;
    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_3564.as::parse() (the first int of each badge)
    slotId: number;
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get ownerCount()
    ownerCount: number;
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get badgeRarityId()
    badgeRarityId: number;
}

/**
 * Interface for BadgesModel
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.BadgesModel (ENGINE only)
 */
export interface IBadgesModel
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::get disposed()
    readonly disposed: boolean;
    readonly maxActiveCount: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::dispose()
    dispose(): void;

    /**
	 * Initialize badges from server message
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::initBadges()
    initBadges(badges: IBadgeData[], getName: (id: string) => string, getDesc: (id: string) => string): void;

    /**
	 * Update or add a badge
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::updateBadge()
    updateBadge(
        badgeId: string,
        isInUse: boolean,
        slotId: number,
        ownerCount: number,
        badgeRarityId: number,
        getName: (id: string) => string,
        getDesc: (id: string) => string
    ): Badge | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getAvailableRareBadgeRarityIds()
    getAvailableRareBadgeRarityIds(): number[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::hasCommonBadgeRarityGroup()
    hasCommonBadgeRarityGroup(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::isUncommonBadgeRarityEnabled()
    isUncommonBadgeRarityEnabled(): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::isStandaloneBadgeRarity()
    isStandaloneBadgeRarity(badgeRarityId: number): boolean;

    /**
	 * Remove a badge
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::removeBadge()
    removeBadge(badgeId: string): boolean;

    /**
	 * Toggle wearing status
	 * Returns the updated badge if changed, null otherwise
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::toggleBadgeWearing()
    toggleBadgeWearing(badgeId: string): Badge | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::saveBadgeSelection()
    saveBadgeSelection(): void;

    /**
	 * Get badges by filter
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadges()
    getBadges(filter?: BadgeFilterType): Badge[];

    /**
	 * Get badge by ID
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadge()
    getBadge(badgeId: string): Badge | null;

    /**
	 * Get badge from active badges by index
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadgeFromActive()
    getBadgeFromActive(index: number): Badge | null;

    /**
	 * Get badge from inactive badges by index
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getBadgeFromInactive()
    getBadgeFromInactive(index: number): Badge | null;

    /**
	 * Get currently selected badge
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::getSelectedBadge()
    getSelectedBadge(filter?: BadgeFilterType): Badge | null;

    /**
	 * Select a badge by ID
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::setBadgeSelected()
    setBadgeSelected(badgeId: string): void;

    /**
	 * Force selection if none selected
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::forceSelection()
    forceSelection(): void;

    /**
	 * Remove all selections
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::removeSelections()
    removeSelections(): void;

    /**
	 * Reset unseen flags
	 * Returns badge IDs that were marked as unseen
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::resetUnseenItems()
    resetUnseenItems(): string[];

    /**
	 * Mark badges as unseen based on IDs
	 */
    updateUnseenItems(unseenIds: number[]): void;

    /**
	 * Get IDs of currently active badges for saving
	 */
    getActiveBadgeIds(): string[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::updateView()
    updateView(): void;
}
