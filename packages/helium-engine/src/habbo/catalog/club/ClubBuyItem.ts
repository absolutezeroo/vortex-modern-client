import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ICatalogPage} from '../viewer/ICatalogPage';
import type {HabboCatalog} from '../HabboCatalog';
import type {ClubBuyOfferData} from './ClubBuyOfferData';

/**
 * A single Club-buy list row (used for both the HC and VIP item lists on the club buy page).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubBuyItem.as
 */
export class ClubBuyItem
{
    private _offer: ClubBuyOfferData;

    private _window: IWindowContainer | null;

    private _page: ICatalogPage;

    constructor(offer: ClubBuyOfferData, page: ICatalogPage)
    {
        this._offer = offer;
        this._page = page;

        const catalog = page.viewer.catalog as HabboCatalog;
        const layoutName = offer.vip ? 'club_buy_vip_item' : 'club_buy_hc_item';

        this._window = catalog.utils.createWindow(layoutName) as unknown as IWindowContainer | null;

        const localization = catalog.localization;

        localization?.registerParameter('catalog.club.item.header', 'months', offer.months.toString());

        const header = this._window?.findChildByName('item_header');

        if(header) header.caption = localization?.getLocalizationRaw('catalog.club.item.header')?.value ?? '';

        localization?.registerParameter('catalog.club.price', 'price', offer.priceInCredits.toString());

        const price = this._window?.findChildByName('item_price');

        if(price) price.caption = localization?.getLocalizationRaw('catalog.club.price')?.value ?? '';

        this._window?.findChildByName('item_buy')?.addEventListener(WindowMouseEvent.CLICK, this.onBuy);
    }

    dispose(): void
    {
        this._window?.dispose();
    }

    private onBuy = (_event: WindowMouseEvent): void =>
    {
        (this._page.viewer.catalog as HabboCatalog).showPurchaseConfirmation(this._offer, this._page.pageId);
    };

    get window(): IWindowContainer | null
    {
        return this._window;
    }
}
