/**
 * Older/alternate offer-state constant set. Not referenced anywhere else in
 * any of the three source trees (win63_2026_crypted_version's `_SafeCls_4489`
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
 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_4489.as
 * (real class name recovered from sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferState.as)
 */
export class MarketPlaceOfferState 
{
    static readonly ONGOING: number = 1;

    // TS-derived name: unreadable in every tree; duplicate value of ONGOING (see class doc).
    static readonly ONGOING_ALT: number = 1;

    static readonly SOLD: number = 2;

    static readonly EXPIRED: number = 3;
}
