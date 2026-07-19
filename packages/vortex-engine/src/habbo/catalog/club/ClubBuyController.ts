import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {Purse} from '../purse/Purse';
import type {HabboCatalog} from '../HabboCatalog';
import type {IVipBuyCatalogWidget} from '../viewer/widgets/IVipBuyCatalogWidget';
import type {ClubBuyOfferData} from './ClubBuyOfferData';
import {ClubBuyConfirmationDialog} from './ClubBuyConfirmationDialog';

/**
 * Drives the Habbo Club/VIP subscription buy flow: requests offers, hands them to the
 * registered widget, and (an unreachable path today - see showConfirmation()'s note) can show
 * its own confirmation dialog.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubBuyController.as
 */
export class ClubBuyController
{
    private _visualization: IVipBuyCatalogWidget | null = null;

    private _catalog: HabboCatalog | null;

    private _offers: ClubBuyOfferData[] = [];

    private _confirmationDialog: ClubBuyConfirmationDialog | null = null;

    private _disposed: boolean = false;

    constructor(catalog: HabboCatalog, _connection: unknown)
    {
        this._catalog = catalog;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._visualization?.dispose();
        this._visualization = null;
        this.reset();
        this.closeConfirmation();
        this._catalog = null;
        this._disposed = true;
    }

    get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }

    reset(): void
    {
        for(const offer of this._offers)
        {
            offer.dispose();
        }

        this._offers = [];
    }

    onOffers(offers: ClubBuyOfferData[]): void
    {
        if(this._disposed) return;

        this.reset();

        this._offers = offers;

        let vipCount = 0;
        let lastVipOffer: ClubBuyOfferData | null = null;

        for(const offer of this._offers)
        {
            if(offer.vip)
            {
                vipCount++;
                lastVipOffer = offer;
            }
        }

        if(vipCount === 1)
        {
            lastVipOffer!.upgradeHcPeriodToVip = true;
        }

        this._offers.sort((a, b) => a.months - b.months);

        if(this._visualization != null)
        {
            this._visualization.reset();
            this._visualization.initClubType(this.getClubType());

            const isGift = this._visualization.isGift;
            const promotedMonths = this.getPromotedMonths(isGift);

            for(const offer of this._offers)
            {
                if(offer.months > 0)
                {
                    if(promotedMonths.length > 0 && promotedMonths.indexOf(offer.months) === -1) continue;

                    this._visualization.showOffer(offer);
                }
            }
        }
    }

    private getPromotedMonths(isGift: boolean): number[]
    {
        const result: number[] = [];
        const key = isGift ? 'catalog.vip.gift.promo' : 'catalog.vip.buy.promo';

        if(this._catalog?.propertyExists(key))
        {
            const raw = this._catalog.getProperty(key);

            if(raw.length > 0)
            {
                for(const part of raw.split(','))
                {
                    const value = parseInt(part, 10);

                    if(!isNaN(value) && value > 0) result.push(value);
                }
            }
        }

        return result;
    }

    unRegisterVisualization(visualization: IVipBuyCatalogWidget): void
    {
        if(this._visualization === visualization) this._visualization = null;
    }

    registerVisualization(visualization: IVipBuyCatalogWidget): void
    {
        this._visualization = visualization;
    }

    requestOffers(source: number): void
    {
        this._catalog?.getHabboClubOffers(source);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/club/ClubBuyController.as::showConfirmation()
    // Reached from HabboCatalog.showPurchaseConfirmation(), which dispatches here when the offer is
    // a ClubBuyOfferData (AS3 HabboCatalog.as:1158-1176). ClubBuyItem and VipBuyItem both hold a
    // ClubBuyOfferData and hand it to showPurchaseConfirmation — they are not meant to call this
    // directly, which is why grepping the club/ and viewer/widgets/ surface for callers finds none.
    showConfirmation(offer: ClubBuyOfferData, pageId: number): void
    {
        this.closeConfirmation();
        this._confirmationDialog = new ClubBuyConfirmationDialog(this, offer, pageId);
    }

    confirmSelection(offer: ClubBuyOfferData, pageId: number): void
    {
        if(!this._catalog || !this._catalog.connection) return;

        this._catalog.purchaseProduct(pageId, offer.offerId);
        this.closeConfirmation();
    }

    closeConfirmation(): void
    {
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    getClubType(): number
    {
        const purse = this._catalog?.getPurse();

        if(purse?.hasClubLeft)
        {
            return purse.isVIP ? 2 : 1;
        }

        return 0;
    }

    get hasClub(): boolean
    {
        return (this._catalog?.getPurse()?.clubDays ?? 0) > 0;
    }

    get windowManager(): IHabboWindowManager | null
    {
        return this._catalog?.windowManager ?? null;
    }

    get localization(): IHabboLocalizationManager | null
    {
        return this._catalog?.localization ?? null;
    }

    get assets(): IAssetLibrary | null
    {
        return this._catalog?.assets ?? null;
    }

    get roomEngine(): IRoomEngine | null
    {
        return this._catalog?.roomEngine ?? null;
    }

    getProductData(localizationId: string): IProductData | null
    {
        return this._catalog?.getProductData(localizationId) ?? null;
    }

    getPurse(): Purse | null
    {
        return this._catalog?.getPurse() ?? null;
    }
}
