import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../../HabboCatalog';
import type {ClubBuyController} from '../../club/ClubBuyController';
import type {ClubBuyOfferData} from '../../club/ClubBuyOfferData';
import {ClubBuyItem} from '../../club/ClubBuyItem';
import type {IVipBuyCatalogWidget} from './IVipBuyCatalogWidget';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('ClubBuyCatalogWidget');

/**
 * Habbo Club purchase widget (the "buy HC/VIP days" catalog page).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ClubBuyCatalogWidget.as
 */
export class ClubBuyCatalogWidget extends CatalogWidget implements IVipBuyCatalogWidget
{
    private _controller: ClubBuyController | null = null;

    private _offers: ClubBuyItem[] = [];

    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._controller?.unRegisterVisualization(this);
        this._controller = null;
        this.reset();
        super.dispose();
    }

    get isGift(): boolean
    {
        return false;
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this._offers = [];
        this.attachWidgetView(CatalogWidgetName.CLUB_BUY);
        this._controller = (this.page.viewer.catalog as HabboCatalog).getClubBuyController();
        this._controller?.registerVisualization(this);
        this._controller?.requestOffers(0);

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

        const catalog = (this.page?.viewer?.catalog ?? null) as HabboCatalog | null;
        const localization = catalog?.localization;
        const purse = catalog?.getPurse();

        if(purse && localization)
        {
            const days = purse.clubPeriods * 31 + purse.clubDays;

            localization.registerParameter('catalog.club.buy.remaining.hc', 'days', days.toString());
            localization.registerParameter('catalog.club.buy.remaining.vip', 'days', days.toString());
        }

        try
        {
            if(this.window)
            {
                switch(clubType)
                {
                    case 0:
                        this.setCaption('club_header', '${catalog.club.buy.header.none}');
                        this.setCaption('club_info', '${catalog.club.buy.info.none}');
                        this.setVisible('club_remaining', false);
                        this.setVisible('club_remaining_bg', false);

                        break;
                    case 1:
                        this.setCaption('club_header', '${catalog.club.buy.header.hc}');
                        this.setCaption('club_info', '${catalog.club.buy.info.hc}');
                        this.setCaption('club_remaining', '${catalog.club.buy.remaining.hc}');

                        break;
                    case 2:
                        this.setCaption('club_header', '${catalog.club.buy.header.vip}');
                        this.setCaption('club_info', '${catalog.club.buy.info.vip}');
                        this.setCaption('club_remaining', '${catalog.club.buy.remaining.vip}');
                        this.showClubInfo();

                        break;
                }
            }
        }
        catch (error)
        {
            log.error('initClubType - Window not properly constructed!', error);
        }

        this.initLinks();
    }

    private setCaption(name: string, value: string): void
    {
        const element = this.window?.findChildByName(name);

        if(element) element.caption = value;
    }

    private setVisible(name: string, visible: boolean): void
    {
        const element = this.window?.findChildByName(name);

        if(element) element.visible = visible;
    }

    private initLinks(): void
    {
        if(!this.window) return;

        const link = this.window.findChildByName('club_link');

        if(link)
        {
            link.setParamFlag(1);
            link.mouseThreshold = 0;
            link.addEventListener(WindowMouseEvent.CLICK, this.onClickLink);
        }
    }

    showOffer(offer: ClubBuyOfferData): void
    {
        if(this.disposed) return;

        log.debug(`Offer: ${[offer.offerId, offer.productCode, offer.priceInCredits, offer.vip, offer.months, offer.daysLeftAfterPurchase, offer.year, offer.month, offer.day, offer.upgradeHcPeriodToVip]}`);

        offer.page = this.page;

        let item: ClubBuyItem;

        try
        {
            item = new ClubBuyItem(offer, this.page);
        }
        catch (error)
        {
            log.error('showOffer - new ClubBuyItem(...) crashed!', error);

            return;
        }

        const listName = offer.vip ? 'item_list_vip' : 'item_list_hc';
        const itemList = this.window?.findChildByName(listName) as unknown as IItemListWindow | null;

        itemList?.addListItem(item.window as unknown as IWindow);

        this._offers.push(item);
    }

    private onClickLink = (event: WindowMouseEvent): void =>
    {
        const target = event.target as unknown as IWindow | null;
        const catalog = this.page.viewer.catalog as HabboCatalog;

        if(target?.name === 'club_link')
        {
            this.openExternalLink(catalog.getProperty('link.format.club'));
        }
    };

    private openExternalLink(url: string): void
    {
        if(url === '') return;

        (this.page.viewer.catalog as HabboCatalog).utils.openLink(url);
    }

    private showClubInfo(): void
    {
        const itemList = this.window?.findChildByName('item_list_hc') as unknown as IItemListWindow | null;

        if(!itemList) return;

        const view = (this.page.viewer.catalog as HabboCatalog).utils.createWindow('club_buy_info_item');

        if(view) itemList.addListItem(view);
    }
}
