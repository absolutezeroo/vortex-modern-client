/**
 * Status values for a marketplace offer in the current user's own-offers list
 * (`MarketPlaceOfferData.status`), and the gate for which statuses
 * `clearOwnHistory()` is allowed to wipe.
 *
 * TS-derived name: this class is obfuscated with no readable-name counterpart
 * in any of the three source trees (win63_2026_crypted_version, win63_version,
 * PRODUCTION-201601012205-226667486 all lack it - it appears to be a newer addition not present in
 * the older trees). Named from usage context: `status` is the
 * `IMarketPlaceOfferData.status` field type, and `isClearable()` gates
 * `IMarketPlace.clearOwnHistory(status)`.
 *
 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_1798.as
 */
export class MarketPlaceOfferStatus 
{
    static readonly OPEN: number = 1;

    static readonly SOLD: number = 2;

    static readonly EXPIRED: number = 3;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/_SafeCls_1798.as::isClearable()
    static isClearable(status: number): boolean 
    {
        return status === MarketPlaceOfferStatus.SOLD || status === MarketPlaceOfferStatus.EXPIRED;
    }
}
