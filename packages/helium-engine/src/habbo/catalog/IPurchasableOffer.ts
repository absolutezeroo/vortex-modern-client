import type {IDisposable} from '@core/runtime/IDisposable';
import type {ICatalogPage} from './viewer/ICatalogPage';
import type {IProduct} from './viewer/IProduct';
import type {IProductContainer} from './viewer/IProductContainer';
import type {IGridItem} from './viewer/IGridItem';

/**
 * A purchasable catalog offer: price(s), the page it belongs to, and its product(s).
 *
 * @see sources/win63_version/habbo/catalog/class_1793.as
 */
export interface IPurchasableOffer extends IDisposable
{
    readonly offerId: number;

    readonly priceInActivityPoints: number;

    readonly activityPointType: number;

    readonly priceInCredits: number;

    readonly priceInSilver: number;

    readonly priceInEmerald: number;

    page: ICatalogPage;

    readonly priceType: string;

    readonly product: IProduct | null;

    readonly productContainer: IProductContainer;

    readonly gridItem: IGridItem;

    readonly localizationId: string;

    readonly bundlePurchaseAllowed: boolean;

    readonly isRentOffer: boolean;

    readonly giftable: boolean;

    readonly pricingModel: string;

    previewCallbackId: number;

    readonly clubLevel: number;

    readonly badgeCode: string;

    readonly extraChatStyleCode: string;

    readonly isSingleChatStyle: boolean;

    readonly localizationName: string;

    readonly localizationDescription: string;
}
