import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboCatalog} from '../HabboCatalog';
import type {ClubBuyOfferData} from './ClubBuyOfferData';

/**
 * A single VIP-buy list row (credits/activity-point price + buy/gift buttons).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/VipBuyItem.as
 */
export class VipBuyItem implements IDisposable
{
    private _offer: ClubBuyOfferData;

    private _window: IWindowContainer | null;

    private _catalog: HabboCatalog;

    private _disposed: boolean = false;

    constructor(offer: ClubBuyOfferData, catalog: HabboCatalog, _contextId: string)
    {
        this._offer = offer;
        this._catalog = catalog;

        this._window = catalog.utils.createWindow('vip_buy_item') as unknown as IWindowContainer | null;

        const localization = catalog.localization;
        let header: string;

        if(offer.months > 0)
        {
            localization?.registerParameter('catalog.vip.item.header.months', 'num_months', offer.months.toString());
            header = localization?.getLocalizationRaw('catalog.vip.item.header.months')?.value ?? '-';
        }
        else
        {
            localization?.registerParameter('catalog.vip.item.header.days', 'num_days', offer.extraDays.toString());
            header = localization?.getLocalizationRaw('catalog.vip.item.header.days')?.value ?? '-';
        }

        const headerElement = this._window?.findChildByName('item_header');

        if(headerElement) headerElement.caption = header;

        const priceBox = this._window?.findChildByName('item_price') as unknown as IWindowContainer | null;

        if(priceBox) catalog.utils.showPriceInContainer(priceBox, offer);

        this._window?.findChildByName('item_buy')?.addEventListener(WindowMouseEvent.CLICK, this.onBuy);

        const giftButton = this._window?.findChildByName('item_gift');

        if(offer.giftable)
        {
            giftButton?.addEventListener(WindowMouseEvent.CLICK, this.onGift);
        }
        else if(giftButton)
        {
            giftButton.visible = false;
        }
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._window?.dispose();
        this._window = null;
        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    private onBuy = (_event: WindowMouseEvent): void =>
    {
        this._catalog.purchaseWillBeGift(false);
        this._catalog.showPurchaseConfirmation(this._offer, this._offer.page?.pageId);
    };

    private onGift = (_event: WindowMouseEvent): void =>
    {
        this._catalog.purchaseWillBeGift(true);
        this._catalog.showPurchaseConfirmation(this._offer, this._offer.page?.pageId);
    };

    get window(): IWindowContainer | null
    {
        return this._window;
    }
}
