/**
 * The numeric product-category taxonomy a catalog offer is classified under.
 *
 * **Class name DERIVED** — it exists in no tree. All three obfuscate it, each with its own
 * scheme (`_SafeCls_3301` in the primary, `class_2866` in `win63_version`, `_SafeCls_3068` in
 * `WIN63-202601121721-391685409`), and PRODUCTION's nearest match has three members rather than
 * fourteen, so it is a different enum. The name here describes what the values are; it is not
 * recovered and must not be cited as such.
 *
 * **Five member names are unrecoverable.** Values 0-3 and 12 are obfuscated in every tree that
 * has the class, so they keep placeholder keys that say so rather than invented ones. The
 * *values* are the contract — a caller switching on 4..11 is unaffected — and the day a call
 * site turns up it will name them. Value 12 exists only in the 2026 build; the two older trees
 * stop at 11.
 *
 * Nothing in the 2026 tree references the class, exactly as with `ProductTypeEnum` next door:
 * every site writes the integer. It is ported so those integers have somewhere to point.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/_SafeCls_3301.as
 */
export const ProductCategoryEnum = {
    // AS3: _SafeCls_3301.as::UNKNOWN
    UNKNOWN: -1,

    // AS3: _SafeCls_3301.as::_SafeStr_10807 — name obfuscated in every tree (`const_174` in
    //   win63_version, `_SafeStr_9934` in the 2026-01 build).
    UNNAMED_0: 0,

    // AS3: _SafeCls_3301.as::_SafeStr_10586 — obfuscated (`const_484` / `_SafeStr_10250`).
    UNNAMED_1: 1,

    // AS3: _SafeCls_3301.as::_SafeStr_10387 — obfuscated (`const_66` / `_SafeStr_9753`).
    UNNAMED_2: 2,

    // AS3: _SafeCls_3301.as::_SafeStr_10500 — obfuscated (`const_425` / `_SafeStr_10191`).
    UNNAMED_3: 3,

    // AS3: _SafeCls_3301.as::BADGE
    BADGE: 4,

    // AS3: _SafeCls_3301.as::GAME_ITEM
    GAME_ITEM: 5,

    // AS3: _SafeCls_3301.as::BOT
    BOT: 6,

    // AS3: _SafeCls_3301.as::MESSENGER_STICKER_SET
    MESSENGER_STICKER_SET: 7,

    // AS3: _SafeCls_3301.as::CURRENCY
    CURRENCY: 8,

    // AS3: _SafeCls_3301.as::CHAT_STYLE
    CHAT_STYLE: 9,

    // AS3: _SafeCls_3301.as::PET
    PET: 10,

    // AS3: _SafeCls_3301.as::CLOTHING
    CLOTHING: 11,

    // AS3: _SafeCls_3301.as::_SafeStr_10431 — obfuscated, and new in the 2026 build: the two
    //   older trees have no value 12 at all.
    UNNAMED_12: 12,
} as const;

// TS-only: the union of the values above, for callers that take one.
export type ProductCategoryEnumType = typeof ProductCategoryEnum[keyof typeof ProductCategoryEnum];
