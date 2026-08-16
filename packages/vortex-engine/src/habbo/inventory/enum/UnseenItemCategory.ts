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
    COLLECTIBLES: 7,
    HABBICON: 8,
} as const;

/**
 * The eighth constant is obfuscated in every tree (`_SafeCls_1779.as::_SafeStr_10431 = 8`), and was
 * left out here on the grounds that nothing referenced it. `HabbiconController` does, five times —
 * `setUnseenItem(8, habbiconId)` on a newly-owned habbicon, `isUnseen`/`removeUnseen`/`resetCategory`
 * around the hub, and `getCount(8)` behind `unseenHabbiconCount`. That fixes what 8 is, so the name
 * is recovered from its use rather than invented.
 */

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
