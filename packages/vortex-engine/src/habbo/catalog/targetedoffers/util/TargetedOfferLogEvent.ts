/**
 * The three analytics actions the targeted-offer flow reports, sent on
 * `EventLogMessageComposer` under the "TargetedOffers" category.
 *
 * The class is obfuscated in every tree so its *name* here is DERIVED, but the three constants
 * are not obfuscated and their values are the literal strings the server matches on.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_3621.as
 */
export class TargetedOfferLogEvent
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_3621.as::TARGETED_OFFER_OPEN_CREDITS_PAGE_CLICKED
    static readonly TARGETED_OFFER_OPEN_CREDITS_PAGE_CLICKED: string = 'targeted.offer.open.credits.page.clicked';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_3621.as::TARGETED_OFFER_WEB_SHOP_INCLIENT_OFFER_CLICKED
    static readonly TARGETED_OFFER_WEB_SHOP_INCLIENT_OFFER_CLICKED: string = 'targeted.offer.web.inclient.clicked';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_3621.as::TARGETED_OFFER_WEB_SHOP_INCLIENT_OFFER_REJECTED
    static readonly TARGETED_OFFER_WEB_SHOP_INCLIENT_OFFER_REJECTED: string = 'targeted.offer.web.inclient.rejected';
}
