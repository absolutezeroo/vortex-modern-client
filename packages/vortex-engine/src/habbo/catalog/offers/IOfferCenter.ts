/**
 * The offer centre as the catalog's UI sees it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/IOfferCenter.as
 */
export interface IOfferCenter
{
    // AS3: IOfferCenter.as::showVideo()
    showVideo(): void;

    // AS3: IOfferCenter.as::showRewards()
    showRewards(): void;

    // AS3: IOfferCenter.as::get showingVideo()
    readonly showingVideo: boolean;
}
