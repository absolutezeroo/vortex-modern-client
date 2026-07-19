import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {OrderedMap} from '@core/utils/OrderedMap';
import type {IMarketPlaceOfferData} from './IMarketPlaceOfferData';
import type {IMarketPlaceVisualization} from './IMarketPlaceVisualization';
import type {MarketplaceItemStats} from './MarketplaceItemStats';
import type {MarketPlaceOfferData} from './MarketPlaceOfferData';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as
 */
export interface IMarketPlace
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get windowManager()
    readonly windowManager: IHabboWindowManager | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get localization()
    readonly localization: IHabboLocalizationManager | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::registerVisualization()
    registerVisualization(visualization?: IMarketPlaceVisualization | null): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onOffers()
    onOffers(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onOwnOffers()
    onOwnOffers(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onBuyResult()
    onBuyResult(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onCancelResult()
    onCancelResult(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onCancelAllResult()
    onCancelAllResult(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::onClearOwnHistoryResult()
    onClearOwnHistoryResult(event: IMessageEvent): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::requestOffersByName()
    requestOffersByName(searchString: string, combineUniques?: boolean): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::requestOffersByPrice()
    requestOffersByPrice(maxPrice: number, combineUniques?: boolean): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::requestOffers()
    requestOffers(minPrice: number, maxPrice: number, searchString: string, category: number, combineUniques?: boolean): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::refreshOffers()
    refreshOffers(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::requestOwnItems()
    requestOwnItems(category?: number): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::requestItemStats()
    requestItemStats(offer: IMarketPlaceOfferData): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::buyOffer()
    buyOffer(offerId: number): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::redeemExpiredOffer()
    redeemExpiredOffer(offerId: number): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::recallAllOffers()
    recallAllOffers(): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::clearOwnHistory()
    clearOwnHistory(status: number): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get ownOffersCategory()
    readonly ownOffersCategory: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::latestOffers()
    latestOffers(): OrderedMap<number, MarketPlaceOfferData> | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::latestOwnOffers()
    latestOwnOffers(): OrderedMap<number, MarketPlaceOfferData> | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::totalItemsFound()
    totalItemsFound(): number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get itemStats()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::set itemStats()
    itemStats: MarketplaceItemStats | null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get creditsWaiting()
    readonly creditsWaiting: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::get averagePricePeriod()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::set averagePricePeriod()
    averagePricePeriod: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::getNameLocalizationKey()
    getNameLocalizationKey(offer: IMarketPlaceOfferData): string;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::getDescriptionLocalizationKey()
    getDescriptionLocalizationKey(offer: IMarketPlaceOfferData): string;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/IMarketPlace.as::isAccountSafetyLocked()
    isAccountSafetyLocked(): boolean;
}
