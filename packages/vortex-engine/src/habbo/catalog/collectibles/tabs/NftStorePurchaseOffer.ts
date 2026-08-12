import type {ICatalogPage} from '../../viewer/ICatalogPage';
import type {IProduct} from '../../viewer/IProduct';
import type {IProductContainer} from '../../viewer/IProductContainer';
import type {IGridItem} from '../../viewer/IGridItem';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {CollectibleItem} from '@habbo/communication/messages/parser/collectibles/CollectibleItem';
import type {NftStoreOffer} from '@habbo/communication/messages/parser/collectibles/NftStoreOffer';

/**
 * Presents an NFT store offer as something `HabboCatalog.showPurchaseConfirmation()` will accept.
 *
 * Almost every member is a constant: an NFT offer has no catalog page, no product, no grid item and
 * no offer id. Only four carry real data — `localizationId`, `productCode`, `priceInEmerald` and
 * `productInfo`. That is AS3's, and it is why the confirmation dialog for an NFT shows so much less
 * than a furniture one.
 *
 * Two of the constants are worth flagging because they read as bugs and are not:
 * `priceType` says `"price_type_silver"` while the only real price is in emeralds, and
 * `activityPointType` is 0 where `ShopTab.onClickBuy()` passes 1001 to the not-enough-points alert.
 * Both are AS3 exactly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/tabs/NftStorePurchaseOffer.as
 */
export class NftStorePurchaseOffer implements IPurchasableOffer
{
    // AS3: NftStorePurchaseOffer.as::_SafeStr_7021 (the wrapped offer)
    private _offer: NftStoreOffer;

    // AS3: NftStorePurchaseOffer.as::NftStorePurchaseOffer()
    constructor(offer: NftStoreOffer)
    {
        this._offer = offer;
    }

    // AS3: NftStorePurchaseOffer.as::get offerId()
    get offerId(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get activityPointType()
    get activityPointType(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get priceInCredits()
    get priceInCredits(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get priceInSilver()
    get priceInSilver(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return this._offer.emeraldPrice;
    }

    /**
     * AS3 returns null and the interface's type is non-null; `IPurchasableOffer.page` is declared
     * `ICatalogPage` here for the same reason, so the cast is what keeps the two honest about a
     * value that genuinely is absent.
     */
    // AS3: NftStorePurchaseOffer.as::get page()
    get page(): ICatalogPage
    {
        return null as unknown as ICatalogPage;
    }

    // AS3: NftStorePurchaseOffer.as::set page()
    set page(_value: ICatalogPage)
    {
        // Empty in AS3: the offer belongs to no page and refuses to be given one.
    }

    /** `"price_type_silver"` in AS3, despite the price being in emeralds. Not a transcription slip. */
    // AS3: NftStorePurchaseOffer.as::get priceType()
    get priceType(): string
    {
        return 'price_type_silver';
    }

    // AS3: NftStorePurchaseOffer.as::get product()
    get product(): IProduct | null
    {
        return null;
    }

    // AS3: NftStorePurchaseOffer.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return null as unknown as IProductContainer;
    }

    // AS3: NftStorePurchaseOffer.as::get gridItem()
    get gridItem(): IGridItem
    {
        return null as unknown as IGridItem;
    }

    // AS3: NftStorePurchaseOffer.as::get localizationId()
    get localizationId(): string
    {
        return this._offer.productCode;
    }

    // AS3: NftStorePurchaseOffer.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    // AS3: NftStorePurchaseOffer.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return false;
    }

    // AS3: NftStorePurchaseOffer.as::get giftable()
    get giftable(): boolean
    {
        return false;
    }

    // AS3: NftStorePurchaseOffer.as::get pricingModel()
    get pricingModel(): string
    {
        return '';
    }

    // AS3: NftStorePurchaseOffer.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::set previewCallbackId()
    set previewCallbackId(_value: number)
    {
        // Empty in AS3: nothing previews an NFT offer through the callback route.
    }

    // AS3: NftStorePurchaseOffer.as::get clubLevel()
    get clubLevel(): number
    {
        return 0;
    }

    // AS3: NftStorePurchaseOffer.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: NftStorePurchaseOffer.as::get localizationName()
    get localizationName(): string
    {
        return '';
    }

    // AS3: NftStorePurchaseOffer.as::get localizationDescription()
    get localizationDescription(): string
    {
        return '';
    }

    // AS3: NftStorePurchaseOffer.as::get productCode()
    get productCode(): string
    {
        return this._offer.productCode;
    }

    // AS3: NftStorePurchaseOffer.as::get productInfo()
    get productInfo(): CollectibleItem
    {
        return this._offer.productInfo;
    }

    // AS3: NftStorePurchaseOffer.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return '';
    }

    // AS3: NftStorePurchaseOffer.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return false;
    }

    /** AS3 hard-codes false, so this offer never reports itself disposed. */
    // AS3: NftStorePurchaseOffer.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }

    // AS3: NftStorePurchaseOffer.as::dispose()
    dispose(): void
    {
        // Empty in AS3: the offer owns nothing.
    }
}
