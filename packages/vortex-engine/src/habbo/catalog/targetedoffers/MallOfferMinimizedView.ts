import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboMallOffer} from './data/HabboMallOffer';
import type {OfferController} from './OfferController';
import {OfferView} from './OfferView';

/**
 * The mall offer folded into the toolbar. Shares `targeted_offer_minimized_xml` with its targeted
 * counterpart, but carries no countdown at all — a mall offer has no expiry, so the base class is
 * constructed with a null offer and the timer never starts.
 *
 * It also always shows the default icon: unlike a targeted offer, the mall payload's own image is
 * only used by the full dialog.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/MallOfferMinimizedView.as
 */
export class MallOfferMinimizedView extends OfferView
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferMinimizedView.as::IMAGE_DEFAULT_URL
    private static readonly IMAGE_DEFAULT_URL: string = 'targetedoffers/offer_default_icon.png';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferMinimizedView.as::_SafeStr_9244 (the mall offer)
    private _mallOffer: HabboMallOffer;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferMinimizedView.as::MallOfferMinimizedView()
    constructor(controller: OfferController, offer: HabboMallOffer)
    {
        super(controller, null);

        this._mallOffer = offer;

        const catalog = controller.catalog;

        this._window = catalog.windowManager?.buildWidgetLayout('targeted_offer_minimized_xml') as IWindowContainer | null;

        if(this._window == null) return;

        const title = this._window.findChildByName('txt_title') as unknown as ITextWindow | null;

        if(title) title.text = this.getLocalization(offer.title) ?? '';

        const libraryUrl = catalog.getProperty('image.library.url');
        const iconWindow = this._window.findChildByName('bmp_icon') as unknown as IStaticBitmapWrapperWindow | null;

        if(iconWindow) iconWindow.assetUri = libraryUrl + MallOfferMinimizedView.IMAGE_DEFAULT_URL;

        this._window.procedure = this.onInput;

        controller.attachExtension(this._window);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferMinimizedView.as::onInput()
    private onInput = (event: WindowEvent, _target: IWindow): void =>
    {
        if(!this._controller || event.type !== 'WME_DOWN') return;

        this._controller.maximizeMallOffer(this._mallOffer);
    };
}
