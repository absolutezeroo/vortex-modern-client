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

const log = Logger.getLogger('LoyaltyVipBuyCatalogWidget');

/**
 * Loyalty-program VIP purchase widget (source 6 - a distinct offer-request source from the
 * regular VipBuyCatalogWidget's 1/2, otherwise near-identical).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/LoyaltyVipBuyCatalogWidget.as
 */
export class LoyaltyVipBuyCatalogWidget extends CatalogWidget implements IVipBuyCatalogWidget
{
    private _controller: ClubBuyController | null = null;

    private _offers: VipBuyItem[] = [];

    private _catalog: HabboCatalog | null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    get isGift(): boolean
    {
        return false;
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
        this._controller?.requestOffers(6);

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

        if(this.window && clubType === 2)
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

    // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/LoyaltyVipBuyCatalogWidget.as::fixFormatting()
    // Same pre-existing ITextFormat align/leading gap as VipBuyCatalogWidget.ts's own note.
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
            item = new VipBuyItem(offer, this._catalog!, 'HabboCatalogBuy');
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
