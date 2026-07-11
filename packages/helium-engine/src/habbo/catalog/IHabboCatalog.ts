import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalogPurse} from './purse/IHabboCatalogPurse';
import type {ICatalogEarnings} from './ICatalogEarnings';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {IPurchasableOffer} from './IPurchasableOffer';
import type {HabboCatalogUtils} from './HabboCatalogUtils';
import type {ICatalogNavigator} from './navigation/ICatalogNavigator';
import type {FrontPageItem} from '@habbo/communication/messages/incoming/catalog/FrontPageItem';
import type {IMarketPlace} from './marketplace/IMarketPlace';

/**
 * Interface for the Habbo catalog.
 *
 * The purse-area implementation uses the same AS3 catalog-owned purse/event flow.
 *
 * @see sources/win63_version/habbo/catalog/IHabboCatalog.as
 */
export interface IHabboCatalog
{
    readonly assets: IAssetLibrary | null;
    readonly windowManager: IHabboWindowManager | null;
    readonly events: EventEmitter;
    readonly localization: IHabboLocalizationManager | null;
    readonly connection: IConnection | null;
    readonly videoOffers: { readonly enabled: boolean };
    readonly privateRoomSessionActive: boolean;
    readonly tradingActive: boolean;
    readonly imageGalleryHost: string;
    readonly buildersClubEnabled: boolean;
    readonly catalogType: string;
    readonly collectorHub: unknown | null;
    readonly utils: HabboCatalogUtils;
    readonly currentCatalogNavigator: ICatalogNavigator | null;
    readonly frontPageItems: FrontPageItem[] | null;

    getSeasonalCurrencyActivityPointType(): number;

    redeemVoucher(voucher: string): void;
    loadCatalogPage(pageId: number, offerId: number, catalogType: string): void;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/HabboCatalog.as::sendGetProductOffer()
    sendGetProductOffer(offerId: number): void;
    getRecyclerStatus(): void;
    getRecyclerPrizes(): void;
    sendRecycleItems(items: unknown[]): void;
    toggleCatalog(catalogType: string, forceOpen?: boolean, showMainWindow?: boolean): void;
    openCatalog(): void;
    openCatalogPage(pageName: string, catalogType?: string | null): void;
    openRoomAdCatalogPageInExtendedMode(
        roomId: string,
        roomName: string,
        flatId: string,
        description: string,
        expiration: Date,
        categoryId: number
    ): void;
    openCatalogPageById(pageId: number, offerId: number, catalogType: string): void;
    openCatalogPageByOfferId(offerId: number, catalogType: string): void;
    openInventoryCategory(category: string): void;
    openCreditsHabblet(): void;
    setupInventoryForRecycler(enabled: boolean): void;
    requestInventoryFurniToRecycler(): number;
    returnInventoryFurniFromRecycler(itemId: number): boolean;
    getProductData(localizationId: string): IProductData | null;
    getFurnitureData(classId: number, productType: string): IFurnitureData | null;
    getPixelEffectIcon(effectId: number): ImageBitmap | null;
    getSubscriptionProductIcon(productId: number): ImageBitmap | null;
    isDraggable(offer: IPurchasableOffer): boolean;
    setImageFromAsset(target: unknown, assetName: string | null, onAssetReady?: ((event: unknown) => void) | null): void;
    getPurse(): IHabboCatalogPurse;
    getEarnings(): ICatalogEarnings;
    getRecycler(): unknown | null;
    getMarketPlace(): IMarketPlace | null;
    getPublicMarketPlaceOffers(minPrice: number, maxPrice: number, searchString: string, category: number, combineUniques?: boolean): void;
    getOwnMarketPlaceOffers(category?: number): void;
    cancelAllMarketPlaceOffers(): void;
    clearOwnMarketPlaceHistory(status: number): void;
    buyMarketPlaceOffer(offerId: number): void;
    redeemSoldMarketPlaceOffers(): void;
    redeemExpiredMarketPlaceOffer(offerId: number): void;
    getMarketplaceItemStats(category: number, furniId: number, extraData?: string | null): void;
    showNotEnoughCreditsAlert(): void;
    showNotEnoughActivityPointsAlert(activityPointType: number): void;
    getHabboClubOffers(clubType: number): void;
    openClubCenter(): void;
    openVault(): void;
    verifyClubLevel(clubLevel?: number): boolean;
    giftReceiver: string;
    buySnowWarTokensOffer(localizationId: string): void;
    showVipBenefits(): void;
    displayProductIcon(productType: string, classId: number, target: unknown): void;
    openRentConfirmationWindow(data: unknown, isWallItem: boolean, extraParam?: number, price?: number, rent?: boolean): void;
    toggleBuilderCatalog(): void;
    getCatalogNavigator(catalogType: string): ICatalogNavigator | null;
    getOfferCenter(extension: unknown): unknown | null;
    itemAddedToInventory(classId: number, itemId: number, category: number): void;
    getActivityPointName(activityPointType: number): string;
    canPlaceWithBC(): boolean;
}
