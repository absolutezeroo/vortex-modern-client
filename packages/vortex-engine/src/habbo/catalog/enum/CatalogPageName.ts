/**
 * The catalog pages the client opens by name rather than by id.
 *
 * The constant and its string rarely match — CATALOG_PAGE_SPECIAL_EFFECTS is "avatar_effects",
 * CATALOG_PAGE_SOLD_RARES is "limited_sold", CATALOG_PAGE_SPEND_NUTS is "set_easter" — so the
 * string is what travels and the name is only how the client refers to it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/CatalogPageName.as
 */
export const CatalogPageName = {
    // AS3: CatalogPageName.as::CATALOG_PAGE_DUCKETS_INFO
    CATALOG_PAGE_DUCKETS_INFO: 'ducket_info',

    // AS3: CatalogPageName.as::CATALOG_PAGE_CREDITS
    CATALOG_PAGE_CREDITS: 'credits',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SPECIAL_EFFECTS
    CATALOG_PAGE_SPECIAL_EFFECTS: 'avatar_effects',

    // AS3: CatalogPageName.as::CATALOG_PAGE_CLUB
    CATALOG_PAGE_CLUB: 'hc_membership',

    // AS3: CatalogPageName.as::CATALOG_PAGE_CLUB_GIFTS
    CATALOG_PAGE_CLUB_GIFTS: 'club_gifts',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SOLD_RARES
    CATALOG_PAGE_SOLD_RARES: 'limited_sold',

    // AS3: CatalogPageName.as::CATALOG_PAGE_PETS_ACCESSORIES
    CATALOG_PAGE_PETS_ACCESSORIES: 'pet_accessories',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SONG_DISK_SHOP
    CATALOG_PAGE_SONG_DISK_SHOP: 'trax_songs',

    // AS3: CatalogPageName.as::CATALOG_PAGE_NEW_ADDITIONS
    CATALOG_PAGE_NEW_ADDITIONS: 'new_additions',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SHELL_GIFTS
    CATALOG_PAGE_SHELL_GIFTS: 'quest_shell',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SNOWFLAKE_GIFTS
    CATALOG_PAGE_SNOWFLAKE_GIFTS: 'quest_snowflakes',

    // AS3: CatalogPageName.as::CATALOG_PAGE_VALENTINES_GIFTS
    CATALOG_PAGE_VALENTINES_GIFTS: 'val_quests',

    // AS3: CatalogPageName.as::CATALOG_PAGE_GROUP_FURNITURE
    CATALOG_PAGE_GROUP_FURNITURE: 'guild_custom_furni',

    // AS3: CatalogPageName.as::CATALOG_PAGE_GIFT_SHOP
    CATALOG_PAGE_GIFT_SHOP: 'gift_shop',

    // AS3: CatalogPageName.as::CATALOG_PAGE_HORSE_STYLES
    CATALOG_PAGE_HORSE_STYLES: 'horse_styles',

    // AS3: CatalogPageName.as::CATALOG_PAGE_HORSE_SHOE
    CATALOG_PAGE_HORSE_SHOE: 'horse_shoe',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SPEND_NUTS
    CATALOG_PAGE_SPEND_NUTS: 'set_easter',

    // AS3: CatalogPageName.as::CATALOG_PAGE_ECOTRON
    CATALOG_PAGE_ECOTRON: 'ecotron_transform',

    // AS3: CatalogPageName.as::CATALOG_PAGE_LOYALTY_POINTS_INFO
    CATALOG_PAGE_LOYALTY_POINTS_INFO: 'loyalty_info',

    // AS3: CatalogPageName.as::CATALOG_PAGE_BUNDLES
    CATALOG_PAGE_BUNDLES: 'room_bundles',

    // AS3: CatalogPageName.as::CATALOG_PAGE_MOBILE_BUNDLES
    CATALOG_PAGE_MOBILE_BUNDLES: 'room_bundles_mobile',

    // AS3: CatalogPageName.as::CATALOG_PAGE_SUBSCRIPTIONS
    CATALOG_PAGE_SUBSCRIPTIONS: 'habbo_club_desktop',

    // AS3: CatalogPageName.as::CATALOG_PAGE_MOBILE_SUBSCRIPTIONS
    CATALOG_PAGE_MOBILE_SUBSCRIPTIONS: 'mobile_subscriptions',
} as const;

export type CatalogPageNameValue = typeof CatalogPageName[keyof typeof CatalogPageName];
