/**
 * What the offer centre tells the toolbar/club UI to light up: a reward has landed, or a video is
 * available to watch.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/IOfferExtension.as
 */
export interface IOfferExtension
{
    // AS3: IOfferExtension.as::indicateRewards()
    indicateRewards(): void;

    // AS3: IOfferExtension.as::indicateVideoAvailable()
    indicateVideoAvailable(available: boolean): void;
}
