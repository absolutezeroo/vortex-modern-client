/**
 * Anything that wants to be told how many rewarded-video offers the ad network has.
 *
 * One implementor: the toolbar's `VideoOfferExtension`, which builds its promo bar on the answer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/IVideoOfferLauncher.as
 */
export interface IVideoOfferLauncher
{
    // AS3: IVideoOfferLauncher.as::offersAvailable()
    offersAvailable(count: number): void;
}
