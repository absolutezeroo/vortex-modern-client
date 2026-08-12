import type {ICatalogPage} from '../../viewer/ICatalogPage';
import type {IProduct} from '../../viewer/IProduct';
import type {IProductContainer} from '../../viewer/IProductContainer';
import type {IGridItem} from '../../viewer/IGridItem';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {MintTokenOffer} from '@habbo/communication/messages/parser/collectibles/MintTokenOffer';

/**
 * Presents a mint-token bundle as something `HabboCatalog.showPurchaseConfirmation()` will accept.
 *
 * The sibling of `NftStorePurchaseOffer` and almost the same shape — the differences are the ones
 * that matter: this one has a real `offerId` and prices in **silver**, where the store offer has no
 * id and prices in emeralds. It also stops at the interface: `NftStorePurchaseOffer` adds
 * `productCode` and `productInfo` getters of its own, and this class declares neither, so the
 * bundle's token count is not reachable through the offer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/MintTokenPurchaseOffer.as
 */
export class MintTokenPurchaseOffer implements IPurchasableOffer
{
    // AS3: MintTokenPurchaseOffer.as::_SafeStr_7021 (the wrapped offer)
    private _offer: MintTokenOffer;

    // AS3: MintTokenPurchaseOffer.as::MintTokenPurchaseOffer()
    constructor(offer: MintTokenOffer)
    {
        this._offer = offer;
    }

    // AS3: MintTokenPurchaseOffer.as::get offerId()
    get offerId(): number
    {
        return this._offer.offerId;
    }

    // AS3: MintTokenPurchaseOffer.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return 0;
    }

    // AS3: MintTokenPurchaseOffer.as::get activityPointType()
    get activityPointType(): number
    {
        return 0;
    }

    // AS3: MintTokenPurchaseOffer.as::get priceInCredits()
    get priceInCredits(): number
    {
        return 0;
    }

    // AS3: MintTokenPurchaseOffer.as::get priceInSilver()
    get priceInSilver(): number
    {
        return this._offer.silverPrice;
    }

    // AS3: MintTokenPurchaseOffer.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return 0;
    }

    /** Null in AS3, and the interface's type is non-null — see `NftStorePurchaseOffer.page`. */
    // AS3: MintTokenPurchaseOffer.as::get page()
    get page(): ICatalogPage
    {
        return null as unknown as ICatalogPage;
    }

    // AS3: MintTokenPurchaseOffer.as::set page()
    set page(_value: ICatalogPage)
    {
        // Empty in AS3.
    }

    // AS3: MintTokenPurchaseOffer.as::get priceType()
    get priceType(): string
    {
        return 'price_type_silver';
    }

    // AS3: MintTokenPurchaseOffer.as::get product()
    get product(): IProduct | null
    {
        return null;
    }

    // AS3: MintTokenPurchaseOffer.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return null as unknown as IProductContainer;
    }

    // AS3: MintTokenPurchaseOffer.as::get gridItem()
    get gridItem(): IGridItem
    {
        return null as unknown as IGridItem;
    }

    // AS3: MintTokenPurchaseOffer.as::get localizationId()
    get localizationId(): string
    {
        return this._offer.productCode;
    }

    // AS3: MintTokenPurchaseOffer.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    // AS3: MintTokenPurchaseOffer.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return false;
    }

    // AS3: MintTokenPurchaseOffer.as::get giftable()
    get giftable(): boolean
    {
        return false;
    }

    // AS3: MintTokenPurchaseOffer.as::get pricingModel()
    get pricingModel(): string
    {
        return '';
    }

    // AS3: MintTokenPurchaseOffer.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return 0;
    }

    // AS3: MintTokenPurchaseOffer.as::set previewCallbackId()
    set previewCallbackId(_value: number)
    {
        // Empty in AS3.
    }

    // AS3: MintTokenPurchaseOffer.as::get clubLevel()
    get clubLevel(): number
    {
        return 0;
    }

    // AS3: MintTokenPurchaseOffer.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: MintTokenPurchaseOffer.as::get localizationName()
    get localizationName(): string
    {
        return '';
    }

    // AS3: MintTokenPurchaseOffer.as::get localizationDescription()
    get localizationDescription(): string
    {
        return '';
    }

    // AS3: MintTokenPurchaseOffer.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return '';
    }

    // AS3: MintTokenPurchaseOffer.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return false;
    }

    // AS3: MintTokenPurchaseOffer.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }

    // AS3: MintTokenPurchaseOffer.as::dispose()
    dispose(): void
    {
        // Empty in AS3.
    }
}
