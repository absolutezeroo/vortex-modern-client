/**
 * Older/alternate offer-state constant set. Not referenced anywhere else in
 * any of the three source trees (WIN63-202607011411-782849652's `_SafeCls_4489`
 * is defined but never imported or used by other classes) - ported for
 * completeness per the full-port mandate, but appears superseded by
 * `MarketPlaceOfferStatus` in the current client.
 *
 * The duplicate `= 1` value (two differently-named constants sharing 1) is a
 * genuine AS3 quirk, confirmed identical across win63_version's `class_4075`
 * and PRODUCTION-201601012205-226667486's `MarketPlaceOfferState` - not decompiler corruption.
 * PRODUCTION-201601012205-226667486 has the real name and the first constant's real name
 * (`ONGOING`); the second `= 1` constant has no readable name in any tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/marketplace/_SafeCls_4489.as
 * (real class name recovered from sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferState.as)
 */
export class MarketPlaceOfferState 
{
    // AS3: .../src/com/sulake/habbo/catalog/marketplace/_SafeCls_4489.as::ONGOING
    static readonly ONGOING: number = 1;

    // TS-derived name: unreadable in every tree; duplicate value of ONGOING (see class doc).
    static readonly ONGOING_ALT: number = 1;

    // AS3: .../src/com/sulake/habbo/catalog/marketplace/_SafeCls_4489.as::SOLD
    static readonly SOLD: number = 2;

    // AS3: .../src/com/sulake/habbo/catalog/marketplace/_SafeCls_4489.as::EXPIRED
    static readonly EXPIRED: number = 3;
}
