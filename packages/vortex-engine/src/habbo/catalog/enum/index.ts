/**
 * The catalog's enums.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/_SafeCls_3301.as
 * is the eighth file in this package and is deliberately not ported. It is a 14-value product
 * category taxonomy (UNKNOWN -1, then BADGE 4, GAME_ITEM 5, BOT 6, MESSENGER_STICKER_SET 7,
 * CURRENCY 8, CHAT_STYLE 9, PET 10, CLOTHING 11 readable, and 0-3 plus 12 obfuscated) whose class
 * name exists in **no** tree — PRODUCTION's `_SafeStr_2308` has three members, not fourteen, so it
 * is a different enum — and which **nothing in the 2026 tree references**, `src/unknowns/`
 * included. Porting it would mean inventing both the class name and five member names for a type
 * no caller needs; when a caller turns up, it will name it.
 */
export * from './BuilderFurniPlaceableStatus';
export * from './CatalogPageName';
export * from './CatalogType';
export * from './ClubOfferRequestSource';
export * from './HabboCatalogTrackingEvent';
export * from './ProductTypeEnum';
export * from './VideoOfferTypeEnum';
