import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../../HabboCatalog';
import type {ClubBuyController} from '../../club/ClubBuyController';
import type {ClubBuyOfferData} from '../../club/ClubBuyOfferData';
import {VipBuyItem} from '../../club/VipBuyItem';
import type {IVipBuyCatalogWidget} from './IVipBuyCatalogWidget';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('VipBuyCatalogWidget');

/**
 * VIP purchase widget (also reused for gifting VIP to another user via the `isGift` constructor
 * flag).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/VipBuyCatalogWidget.as
 */
export class VipBuyCatalogWidget extends CatalogWidget implements IVipBuyCatalogWidget
{
    private _controller: ClubBuyController | null = null;

    private _offers: VipBuyItem[] = [];

    private _catalog: HabboCatalog | null;

    private _isGift: boolean;

    constructor(window: IWindowContainer, catalog: HabboCatalog, isGift: boolean = false)
    {
        super(window);

        this._catalog = catalog;
        this._isGift = isGift;
    }

    get isGift(): boolean
    {
        return this._isGift;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._controller?.unRegisterVisualization(this);
        this._controller = null;
        this.reset();
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this._offers = [];
        this._controller = this._catalog?.getClubBuyController() ?? null;
        this._controller?.registerVisualization(this);
        this._controller?.requestOffers(this._isGift ? 2 : 1);

        return true;
    }

    reset(): void
    {
        for(const item of this._offers)
        {
            item.dispose();
        }

        this._offers = [];
    }

    initClubType(clubType: number): void
    {
        if(this.disposed) return;

        const localization = this._catalog?.localization;
        const purse = this._catalog?.getPurse();

        if(purse != null && localization != null)
        {
            const days = purse.clubPeriods * 31 + purse.clubDays;

            localization.registerParameter('catalog.vip.extend.info', 'days', days.toString());
        }

        if(this.window && clubType === 2 && !this._isGift)
        {
            const vipTitle = this.window.findChildByName('vip_title');

            if(vipTitle) vipTitle.caption = '${catalog.vip.extend.title}';

            const vipInfo = this.window.findChildByName('vip_info');

            if(vipInfo) vipInfo.caption = '${catalog.vip.extend.info}';
        }

        if(this.window)
        {
            this.fixFormatting(this.window.findChildByName('vip_title') as unknown as ITextWindow | null);
            this.fixFormatting(this.window.findChildByName('vip_info') as unknown as ITextWindow | null, 3);
        }

        this.initLinks();
    }

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/VipBuyCatalogWidget.as::fixFormatting()
    // ITextFormat (ITextWindow.ts) doesn't carry align/leading yet - documented pre-existing gap
    // ("not threaded through here since no current caller needs them"); this is now a real caller,
    // but extending the shared per-range text-format type is out of scope for this widget.
    private fixFormatting(_field: ITextWindow | null, _leading: number = 0): void
    {
    }

    private initLinks(): void
    {
        if(!this.window) return;

        const vipLink = this.window.findChildByName('vip_link');

        if(vipLink)
        {
            vipLink.addEventListener(WindowMouseEvent.CLICK, this.onBenefits);
            vipLink.mouseThreshold = 0;
        }

        const hcCenterLink = this.window.findChildByName('hccenter_link') as unknown as ITextWindow | null;

        if(hcCenterLink && this._controller)
        {
            hcCenterLink.text = this._controller.localization?.getLocalization('catalog.vip.buy.hccenter', 'catalog.vip.buy.hccenter') ?? 'catalog.vip.buy.hccenter';
            this.setLinkStyle(hcCenterLink);
        }
    }

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/VipBuyCatalogWidget.as::setLinkStyle()
    // Needs a flash.text.StyleSheet-equivalent (CSS-in-caption rendering) - same pre-existing gap
    // already documented in LocalizationCatalogWidget.ts's own setLinkStyle() note.
    private setLinkStyle(_field: ITextWindow): void
    {
    }

    private onBenefits = (_event: WindowMouseEvent): void =>
    {
        this._catalog?.utils.showVipBenefits();
    };

    showOffer(offer: ClubBuyOfferData): void
    {
        if(this.disposed || !offer.vip) return;

        log.debug(`Offer: ${[offer.offerId, offer.productCode, offer.priceInCredits, offer.vip, offer.months, offer.daysLeftAfterPurchase, offer.year, offer.month, offer.day, offer.upgradeHcPeriodToVip]}`);

        offer.page = this.page;

        let item: VipBuyItem;

        try
        {
            item = new VipBuyItem(offer, this._catalog!, this._isGift ? 'HabboCatalogGift' : 'HabboCatalogBuy');
        }
        catch (error)
        {
            log.error('showOffer - new VipBuyItem(...) crashed!', error);

            return;
        }

        const itemList = this.window?.findChildByName('item_list_vip') as unknown as IItemListWindow | null;

        itemList?.addListItem(item.window as unknown as IWindow);

        this._offers.push(item);
    }
}
