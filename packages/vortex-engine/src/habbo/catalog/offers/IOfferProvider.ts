import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * One rewarded-video network. The offer centre keeps several and picks the first that is both
 * enabled and has a video ready.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/IOfferProvider.as
 */
export interface IOfferProvider extends IDisposable
{
    // AS3: IOfferProvider.as::get enabled()
    readonly enabled: boolean;

    // AS3: IOfferProvider.as::load()
    load(): void;

    // AS3: IOfferProvider.as::showVideo()
    showVideo(): void;

    // AS3: IOfferProvider.as::get videoAvailable()
    readonly videoAvailable: boolean;

    // AS3: IOfferProvider.as::get showingPopup()
    readonly showingPopup: boolean;
}
