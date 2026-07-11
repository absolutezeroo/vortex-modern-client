import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboCatalog} from '../HabboCatalog';
import {GetMarketplaceConfigurationMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceConfigurationMessageComposer';
import type {MarketPlaceOffersEvent} from '@habbo/communication/messages/incoming/marketplace/MarketPlaceOffersEvent';
import type {MarketPlaceOwnOffersEvent} from '@habbo/communication/messages/incoming/marketplace/MarketPlaceOwnOffersEvent';
import type {MarketplaceBuyOfferResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceBuyOfferResultEvent';
import type {MarketplaceCancelOfferResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceCancelOfferResultEvent';
import type {MarketplaceCancelAllOffersResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceCancelAllOffersResultEvent';
import type {MarketplaceClearOwnHistoryResultEvent} from '@habbo/communication/messages/incoming/marketplace/MarketplaceClearOwnHistoryResultEvent';
import type {MarketPlaceOffersEventParser} from '@habbo/communication/messages/parser/marketplace/MarketPlaceOffersEventParser';
import type {MarketPlaceOwnOffersEventParser} from '@habbo/communication/messages/parser/marketplace/MarketPlaceOwnOffersEventParser';
import type {MarketplaceBuyOfferResultEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceBuyOfferResultEventParser';
import type {MarketplaceCancelOfferResultEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceCancelOfferResultEventParser';
import type {MarketplaceCancelAllOffersResultEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceCancelAllOffersResultEventParser';
import type {MarketplaceClearOwnHistoryResultEventParser} from '@habbo/communication/messages/parser/marketplace/MarketplaceClearOwnHistoryResultEventParser';
import type {IMarketPlace} from './IMarketPlace';
import type {IMarketPlaceOfferData} from './IMarketPlaceOfferData';
import type {IMarketPlaceVisualization} from './IMarketPlaceVisualization';
import {MarketPlaceOfferData} from './MarketPlaceOfferData';
import {MarketPlaceOfferStatus} from './MarketPlaceOfferStatus';
import type {MarketplaceItemStats} from './MarketplaceItemStats';
import {MarketplaceConfirmationDialog} from './MarketplaceConfirmationDialog';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as
 */
export class MarketPlaceLogic implements IMarketPlace
{
    static readonly PURCHASE_CONFIRM_TYPE_NORMAL: number = 1;

    static readonly PURCHASE_CONFIRM_TYPE_HIGHER: number = 2;

    private _catalog: HabboCatalog | null;

    private _windowManager: IHabboWindowManager | null;

    private _roomEngine: IRoomEngine | null;

    private _visualization: IMarketPlaceVisualization | null = null;

    private _confirmationDialog: MarketplaceConfirmationDialog | null = null;

    private _latestOffers: OrderedMap<number, MarketPlaceOfferData> | null = null;

    private _latestOwnOffers: OrderedMap<number, MarketPlaceOfferData> | null = null;

    private _creditsWaiting: number = 0;

    private _averagePricePeriod: number = -1;

    private _itemStats: MarketplaceItemStats | null = null;

    private _statsFurniCategoryId: number = 0;

    private _statsFurniTypeId: number = 0;

    private _totalItemsFound: number = 0;

    private _ownOffersCategory: number = 1;

    private _pendingClearHistoryCategory: number = 0;

    private _minPrice: number = 0;

    private _maxPrice: number = 0;

    private _searchString: string = '';

    private _category: number = -1;

    private _combineUniques: boolean = true;

    private _disposed: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::MarketPlaceLogic()
    constructor(catalog: HabboCatalog, windowManager: IHabboWindowManager, roomEngine: IRoomEngine)
    {
        this._catalog = catalog;
        this._windowManager = windowManager;
        this._roomEngine = roomEngine;
        this.getConfiguration();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._catalog = null;
        this._windowManager = null;

        if(this._latestOffers)
        {
            this.disposeOffers(this._latestOffers);
            this._latestOffers = null;
        }

        if(this._latestOwnOffers)
        {
            this.disposeOffers(this._latestOwnOffers);
            this._latestOwnOffers = null;
        }

        this._disposed = true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._catalog?.localization ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::registerVisualization()
    registerVisualization(visualization: IMarketPlaceVisualization | null = null): void
    {
        if(visualization === null) return;

        this._visualization = visualization;
    }

    private getConfiguration(): void
    {
        if(!this._catalog || !this._catalog.connection) return;

        this._catalog.connection.send(new GetMarketplaceConfigurationMessageComposer());
    }

    private showConfirmation(type: number, offer: MarketPlaceOfferData): void
    {
        if(!this._confirmationDialog)
        {
            this._confirmationDialog = new MarketplaceConfirmationDialog(this, this._catalog!, this._roomEngine!);
        }

        this._confirmationDialog.showConfirmation(type, offer);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::requestOffersByName()
    requestOffersByName(searchString: string, combineUniques: boolean = true): void
    {
        this.requestOffers(-1, -1, searchString, -1, combineUniques);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::requestOffersByPrice()
    requestOffersByPrice(maxPrice: number, combineUniques: boolean = true): void
    {
        this.requestOffers(maxPrice, -1, '', -1, combineUniques);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::requestOffers()
    requestOffers(minPrice: number, maxPrice: number, searchString: string, category: number, combineUniques: boolean = true): void
    {
        this._minPrice = minPrice;
        this._maxPrice = maxPrice;
        this._searchString = searchString;
        this._category = category;
        this._combineUniques = combineUniques;

        this._catalog?.getPublicMarketPlaceOffers(minPrice, maxPrice, searchString, category, combineUniques);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::refreshOffers()
    refreshOffers(): void
    {
        this.requestOffers(this._minPrice, this._maxPrice, this._searchString, this._category, this._combineUniques);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::requestOwnItems()
    requestOwnItems(category: number = 1): void
    {
        this._ownOffersCategory = category;

        this._catalog?.getOwnMarketPlaceOffers(category);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::requestItemStats()
    requestItemStats(offer: IMarketPlaceOfferData): void
    {
        if(!this._catalog || !offer) return;

        this._statsFurniTypeId = offer.furniId;
        this._statsFurniCategoryId = this.resolveStatsRequestCategory(offer);

        let extraData: string | null = null;

        if(this.isPosterItem(offer)) extraData = offer.extraData;

        this._catalog.getMarketplaceItemStats(this._statsFurniCategoryId, offer.furniId, extraData);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::buyOffer()
    buyOffer(offerId: number): void
    {
        if(!this._latestOffers || !this._catalog || !this._catalog.getPurse()) return;

        const offer = this._latestOffers.getValue(offerId);

        if(!offer) return;

        if((this._catalog.getPurse()?.credits ?? 0) < offer.price)
        {
            this._catalog.showNotEnoughCreditsAlert();

            return;
        }

        this.showConfirmation(MarketPlaceLogic.PURCHASE_CONFIRM_TYPE_NORMAL, offer);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::redeemExpiredOffer()
    redeemExpiredOffer(offerId: number): void
    {
        this._catalog?.redeemExpiredMarketPlaceOffer(offerId);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::recallAllOffers()
    recallAllOffers(): void
    {
        this._catalog?.cancelAllMarketPlaceOffers();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::clearOwnHistory()
    clearOwnHistory(status: number): void
    {
        if(!this._catalog || !MarketPlaceOfferStatus.isClearable(status)) return;

        this._pendingClearHistoryCategory = status;
        this._catalog.clearOwnMarketPlaceHistory(status);
    }

    private disposeOffers(offers: OrderedMap<number, MarketPlaceOfferData>): void
    {
        for(const offer of offers.values())
        {
            offer?.dispose();
        }

        offers.dispose();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onOffers()
    onOffers(event: IMessageEvent): void
    {
        const offersEvent = event as MarketPlaceOffersEvent | null;

        if(!offersEvent) return;

        const parser = offersEvent.parser as MarketPlaceOffersEventParser | null;

        if(!parser) return;

        if(this._latestOffers) this.disposeOffers(this._latestOffers);

        this._latestOffers = new OrderedMap<number, MarketPlaceOfferData>();

        for(const raw of parser.offers)
        {
            const offer = new MarketPlaceOfferData(
                raw.offerId, raw.furniId, raw.furniType, raw.extraData, raw.stuffData, raw.price,
                raw.status, raw.averagePrice, raw.offerCount, raw.isUsable, raw.isUsed);

            offer.timeLeftMinutes = raw.timeLeftMinutes;
            this._latestOffers.add(raw.offerId, offer);
        }

        this._totalItemsFound = parser.totalItemsFound;

        this._visualization?.listUpdatedNotify();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onOwnOffers()
    onOwnOffers(event: IMessageEvent): void
    {
        const ownOffersEvent = event as MarketPlaceOwnOffersEvent | null;

        if(!ownOffersEvent) return;

        const parser = ownOffersEvent.parser as MarketPlaceOwnOffersEventParser | null;

        if(!parser) return;

        if(this._latestOwnOffers) this.disposeOffers(this._latestOwnOffers);

        this._latestOwnOffers = new OrderedMap<number, MarketPlaceOfferData>();
        this._creditsWaiting = parser.creditsWaiting;

        for(const raw of parser.offers)
        {
            const offer = new MarketPlaceOfferData(
                raw.offerId, raw.furniId, raw.furniType, raw.extraData, raw.stuffData, raw.price,
                raw.status, raw.averagePrice);

            offer.timeLeftMinutes = raw.timeLeftMinutes;
            offer.statusTime = raw.statusTime;
            this._latestOwnOffers.add(raw.offerId, offer);
        }

        this._visualization?.listUpdatedNotify();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onBuyResult()
    onBuyResult(event: IMessageEvent): void
    {
        const buyEvent = event as MarketplaceBuyOfferResultEvent | null;

        if(!buyEvent) return;

        const parser = buyEvent.parser as MarketplaceBuyOfferResultEventParser | null;

        if(!parser) return;

        if(parser.result === 1)
        {
            this.refreshOffers();
        }
        else if(parser.result === 2)
        {
            const item = this._latestOffers?.remove(parser.requestedOfferId) ?? null;

            item?.dispose();
            this._visualization?.listUpdatedNotify();
            this._windowManager?.alert(
                '${catalog.marketplace.not_available_title}', '${catalog.marketplace.not_available_header}', 0,
                (dialog) => dialog.dispose());
        }
        else if(parser.result === 3)
        {
            const updateItem = this._latestOffers?.getValue(parser.requestedOfferId) ?? null;

            if(updateItem)
            {
                updateItem.offerId = parser.offerId;
                updateItem.price = parser.newPrice;
                updateItem.offerCount--;
                this._latestOffers?.add(parser.offerId, updateItem);
            }

            this._latestOffers?.remove(parser.requestedOfferId);

            if(updateItem) this.showConfirmation(MarketPlaceLogic.PURCHASE_CONFIRM_TYPE_HIGHER, updateItem);

            this._visualization?.listUpdatedNotify();
        }
        else if(parser.result === 4)
        {
            this._windowManager?.alert(
                '${catalog.alert.notenough.title}', '${catalog.alert.notenough.credits.description}', 0,
                (dialog) => dialog.dispose());
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onCancelResult()
    onCancelResult(event: IMessageEvent): void
    {
        const cancelEvent = event as MarketplaceCancelOfferResultEvent | null;

        if(!cancelEvent) return;

        const parser = cancelEvent.parser as MarketplaceCancelOfferResultEventParser | null;

        if(!parser) return;

        if(parser.success)
        {
            const item = this._latestOwnOffers?.remove(parser.offerId) ?? null;

            item?.dispose();
            this._visualization?.removeOfferIds([parser.offerId]);
        }
        else
        {
            this._windowManager?.alert(
                '${catalog.marketplace.operation_failed.topic}', '${catalog.marketplace.cancel_failed}', 0,
                (dialog) => dialog.dispose());
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onCancelAllResult()
    onCancelAllResult(event: IMessageEvent): void
    {
        const cancelEvent = event as MarketplaceCancelAllOffersResultEvent | null;

        if(!cancelEvent) return;

        const parser = cancelEvent.parser as MarketplaceCancelAllOffersResultEventParser | null;

        if(!parser) return;

        if(parser.success)
        {
            const removedOfferIds: number[] = [];

            if(this._latestOwnOffers)
            {
                for(const offerId of parser.offerIds)
                {
                    const item = this._latestOwnOffers.remove(offerId);

                    if(item)
                    {
                        removedOfferIds.push(offerId);
                        item.dispose();
                    }
                }
            }

            this._visualization?.removeOfferIds(removedOfferIds);
        }
        else
        {
            this._windowManager?.alert(
                '${catalog.marketplace.operation_failed.topic}', '${shop.marketplace.recall.failed}', 0,
                (dialog) => dialog.dispose());
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::onClearOwnHistoryResult()
    onClearOwnHistoryResult(event: IMessageEvent): void
    {
        const clearEvent = event as MarketplaceClearOwnHistoryResultEvent | null;

        if(!clearEvent) return;

        const parser = clearEvent.parser as MarketplaceClearOwnHistoryResultEventParser | null;

        if(!parser) return;

        const pendingCategory = this._pendingClearHistoryCategory;

        this._pendingClearHistoryCategory = 0;

        if(parser.success)
        {
            if(pendingCategory !== this._ownOffersCategory || !this._latestOwnOffers) return;

            const removedOfferIds = this._latestOwnOffers.getKeys() ?? [];

            for(const offerId of removedOfferIds)
            {
                const item = this._latestOwnOffers.remove(offerId);

                item?.dispose();
            }

            this._visualization?.removeOfferIds(removedOfferIds);
        }
        else
        {
            this._windowManager?.alert(
                '${catalog.marketplace.operation_failed.topic}', '${shop.marketplace.mark.as.seen.failed}', 0,
                (dialog) => dialog.dispose());
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::latestOffers()
    latestOffers(): OrderedMap<number, MarketPlaceOfferData> | null
    {
        return this._latestOffers;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::latestOwnOffers()
    latestOwnOffers(): OrderedMap<number, MarketPlaceOfferData> | null
    {
        return this._latestOwnOffers;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::totalItemsFound()
    totalItemsFound(): number
    {
        return this._totalItemsFound;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::set itemStats()
    set itemStats(value: MarketplaceItemStats)
    {
        if(value.furniCategoryId !== this._statsFurniCategoryId || value.furniTypeId !== this._statsFurniTypeId) return;

        this._itemStats = value;
        this._visualization?.updateStats();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get itemStats()
    get itemStats(): MarketplaceItemStats | null
    {
        return this._itemStats;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get creditsWaiting()
    get creditsWaiting(): number
    {
        return this._creditsWaiting;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get ownOffersCategory()
    get ownOffersCategory(): number
    {
        return this._ownOffersCategory;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::get averagePricePeriod()
    get averagePricePeriod(): number
    {
        return this._averagePricePeriod;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::set averagePricePeriod()
    set averagePricePeriod(value: number)
    {
        this._averagePricePeriod = value;
    }

    private resolveStatsRequestCategory(offer: IMarketPlaceOfferData | null): number
    {
        if(offer && offer.isUniqueLimitedItem) return 3;

        return offer && offer.furniType === 2 ? 2 : 1;
    }

    private isPosterItem(offer: IMarketPlaceOfferData): boolean
    {
        if(offer.furniType === 2 && offer.extraData != null)
        {
            const furnitureData = this._catalog?.getFurnitureData(offer.furniId, 'i');

            if(furnitureData?.className === 'poster') return true;
        }

        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::getNameLocalizationKey()
    getNameLocalizationKey(offer: IMarketPlaceOfferData): string
    {
        if(!offer) return '';

        if(this.isPosterItem(offer)) return `poster_${offer.extraData}_name`;

        if(offer.furniType === 1) return `roomItem.name.${offer.furniId}`;

        if(offer.furniType === 2) return `wallItem.name.${offer.furniId}`;

        return '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::getDescriptionLocalizationKey()
    getDescriptionLocalizationKey(offer: IMarketPlaceOfferData): string
    {
        if(!offer) return '';

        if(this.isPosterItem(offer)) return `poster_${offer.extraData}_desc`;

        if(offer.furniType === 1) return `roomItem.desc.${offer.furniId}`;

        if(offer.furniType === 2) return `wallItem.desc.${offer.furniId}`;

        return '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceLogic.as::isAccountSafetyLocked()
    isAccountSafetyLocked(): boolean
    {
        return this._catalog?.sessionDataManager?.isAccountSafetyLocked() ?? false;
    }
}
