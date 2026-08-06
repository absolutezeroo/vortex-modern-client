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
    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get offerId()
    readonly offerId: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get priceInActivityPoints()
    readonly priceInActivityPoints: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get activityPointType()
    readonly activityPointType: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get priceInCredits()
    readonly priceInCredits: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get priceInSilver()
    readonly priceInSilver: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get priceInEmerald()
    readonly priceInEmerald: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get page()
    page: ICatalogPage;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get priceType()
    readonly priceType: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get product()
    readonly product: IProduct | null;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get productContainer()
    readonly productContainer: IProductContainer;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get gridItem()
    readonly gridItem: IGridItem;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get localizationId()
    readonly localizationId: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get bundlePurchaseAllowed()
    readonly bundlePurchaseAllowed: boolean;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get isRentOffer()
    readonly isRentOffer: boolean;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get giftable()
    readonly giftable: boolean;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get pricingModel()
    readonly pricingModel: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get previewCallbackId()
    previewCallbackId: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get clubLevel()
    readonly clubLevel: number;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get badgeCode()
    readonly badgeCode: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get extraChatStyleCode()
    readonly extraChatStyleCode: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get isSingleChatStyle()
    readonly isSingleChatStyle: boolean;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get localizationName()
    readonly localizationName: string;

    // AS3: sources/win63_version/habbo/catalog/class_1793.as::get localizationDescription()
    readonly localizationDescription: string;
}
