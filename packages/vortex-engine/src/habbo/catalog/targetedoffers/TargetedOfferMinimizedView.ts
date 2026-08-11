import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {TargetedOffer} from './data/TargetedOffer';
import type {OfferController} from './OfferController';
import {OfferView} from './OfferView';

/**
 * The targeted offer folded down into the toolbar: icon, title, countdown, and a click that brings
 * the full dialog back.
 *
 * Note where the countdown goes when the offer has no expiry — the row is *removed from the item
 * list*, not hidden, because this window sits in the toolbar strip and its width has to shrink.
 * The full dialog only sets `visible = false` for the same case.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferMinimizedView.as
 */
export class TargetedOfferMinimizedView extends OfferView
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferMinimizedView.as::IMAGE_DEFAULT_URL
    private static readonly IMAGE_DEFAULT_URL: string = 'targetedoffers/offer_default_icon.png';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferMinimizedView.as::TargetedOfferMinimizedView()
    constructor(controller: OfferController, offer: TargetedOffer)
    {
        super(controller, offer);

        const catalog = controller.catalog;

        this._window = catalog.windowManager?.buildWidgetLayout('targeted_offer_minimized_xml') as IWindowContainer | null;

        if(this._window == null) return;

        const title = this._window.findChildByName('txt_title') as unknown as ITextWindow | null;

        if(title) title.text = this.getLocalization(offer.title) ?? '';

        const libraryUrl = catalog.getProperty('image.library.url');
        const icon = offer.iconImageUrl && offer.iconImageUrl.length > 0
            ? offer.iconImageUrl
            : TargetedOfferMinimizedView.IMAGE_DEFAULT_URL;

        const iconWindow = this._window.findChildByName('bmp_icon') as unknown as IStaticBitmapWrapperWindow | null;

        if(iconWindow) iconWindow.assetUri = libraryUrl + icon;

        this._timeLeftTemplate = this.getLocalization('targeted.offer.minimized.timeleft', '') ?? '';

        if(offer.expirationTime === 0)
        {
            const itemList = this._window.findChildByName('itemlist') as unknown as IItemListWindow | null;
            const timeLeftRow = this._window.findChildByName('cnt_time_left');

            if(itemList && timeLeftRow) itemList.removeListItem(timeLeftRow);
        }
        else
        {
            this.startUpdateTimer();
        }

        this._window.procedure = this.onInput;

        controller.attachExtension(this._window);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/TargetedOfferMinimizedView.as::onInput()
    private onInput = (event: WindowEvent, _target: IWindow): void =>
    {
        if(!this._controller || event.type !== 'WME_DOWN') return;

        this._controller.maximizeOffer(this._offer!);
    };
}
