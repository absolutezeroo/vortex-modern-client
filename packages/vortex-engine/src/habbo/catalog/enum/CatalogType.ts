/**
 * Which catalog a page belongs to.
 *
 * Note `BUILDER`'s value is `"BUILDERS_CLUB"`, not `"BUILDER"` — the constant's name and its string
 * differ, and it is the string that travels. This port already had the literal spelled out in
 * `HabboCatalog`; the enum is what it should have been reading.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/CatalogType.as
 */
export const CatalogType = {
    // AS3: CatalogType.as::NORMAL
    NORMAL: 'NORMAL',

    // AS3: CatalogType.as::BUILDER
    BUILDER: 'BUILDERS_CLUB',
} as const;

export type CatalogTypeValue = typeof CatalogType[keyof typeof CatalogType];
