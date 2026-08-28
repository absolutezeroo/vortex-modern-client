/**
 * Where a Habbo Club offer request came from, sent so the server can attribute the purchase.
 *
 * **Class name RECOVERED** from `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/
 * catalog/enum/ClubOfferRequestSource.as`; the 2026 tree obfuscates it to `_SafeCls_2177` while
 * keeping every member readable. PRODUCTION is the reverse — readable filename, obfuscated members
 * — so the two together give the whole class and neither alone does.
 *
 * Note 5 is absent from PRODUCTION's copy: SNOWSTORM was added after the 2016 build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/_SafeCls_2177.as
 */
export const ClubOfferRequestSource = {
    // AS3: _SafeCls_2177.as::SOURCE_CATALOG_BUY_CLUB_PAGE
    SOURCE_CATALOG_BUY_CLUB_PAGE: 0,

    // AS3: _SafeCls_2177.as::SOURCE_CATALOG_BUY_VIP_PAGE
    SOURCE_CATALOG_BUY_VIP_PAGE: 1,

    // AS3: _SafeCls_2177.as::SOURCE_CATALOG_GIFT_VIP_PAGE
    SOURCE_CATALOG_GIFT_VIP_PAGE: 2,

    // AS3: _SafeCls_2177.as::SOURCE_QUICK_BUY_VIP_DIALOG
    SOURCE_QUICK_BUY_VIP_DIALOG: 3,

    // AS3: _SafeCls_2177.as::SOURCE_DIRECT_SMS_DIALOG
    SOURCE_DIRECT_SMS_DIALOG: 4,

    // AS3: _SafeCls_2177.as::SOURCE_SNOWSTORM
    SOURCE_SNOWSTORM: 5,

    // AS3: _SafeCls_2177.as::SOURCE_CATALOG_LOYALTY_PAGE
    SOURCE_CATALOG_LOYALTY_PAGE: 6,
} as const;

export type ClubOfferRequestSourceValue =
    typeof ClubOfferRequestSource[keyof typeof ClubOfferRequestSource];
