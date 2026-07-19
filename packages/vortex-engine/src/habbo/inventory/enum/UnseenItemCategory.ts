/**
 * Unseen item category constants
 *
 * Based on AS3 com.sulake.habbo.inventory.enum.class_3364
 */
export const UnseenItemCategory = {
    OWNED_FURNI: 1,
    RENTED_FURNI: 2,
    PET: 3,
    BADGE: 4,
    BOT: 5,
    GAMES: 6,
} as const;

export type UnseenItemCategoryType = typeof UnseenItemCategory[keyof typeof UnseenItemCategory];

/**
 * All inventory categories that can have unseen items
 */
export const INVENTORY_CATEGORIES = [
    UnseenItemCategory.OWNED_FURNI,
    UnseenItemCategory.RENTED_FURNI,
    UnseenItemCategory.PET,
    UnseenItemCategory.BADGE,
    UnseenItemCategory.BOT,
] as const;
