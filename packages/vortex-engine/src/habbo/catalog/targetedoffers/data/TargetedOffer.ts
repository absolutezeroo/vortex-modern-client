import type {IHabboCatalog} from '../../IHabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IHabboCatalogPurse} from '../../purse/IHabboCatalogPurse';
import type {ICatalogPage} from '../../viewer/ICatalogPage';
import type {IProduct} from '../../viewer/IProduct';
import type {IProductContainer} from '../../viewer/IProductContainer';
import type {IGridItem} from '../../viewer/IGridItem';
import {TargetedOfferData} from '@habbo/communication/messages/incoming/catalog/TargetedOfferData';

/**
 * A targeted offer, seen as something the catalog can display and sell.
 *
 * This is the parsed message data (`TargetedOfferData`) wearing the catalog's `IPurchasableOffer`
 * shape. Nearly every member of that interface is a hard-coded empty answer, and deliberately so:
 * a targeted offer has no page, no grid item, no product container and no localization id — it is
 * rendered by its own dialog, not by the catalog page machinery. The interface is implemented only
 * so the offer can be handed to code that expects one.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as
 */
export class TargetedOffer extends TargetedOfferData implements IPurchasableOffer
{
    /**
     * Name DERIVED: obfuscated in every tree. The grace period subtracted from the countdown, so
     * the client stops offering a purchase slightly before the server would refuse it.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::_SafeStr_10852
    static readonly EXPIRY_GRACE_SECONDS: number = 10;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::TargetedOffer()
    constructor(source: TargetedOfferData | null = null)
    {
        super(source);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::isExpired()
    isExpired(): boolean
    {
        return this._expirationTime > 0 && this.getSecondsRemaining() <= 0;
    }

    /**
     * Seconds left before the offer stops being purchasable.
     *
     * The `>>> 0` is not defensive rounding — it reproduces an AS3 `uint` local. Once the expiry
     * has passed the subtraction goes negative and AS3 wraps it to roughly 4.29e9 rather than
     * reporting zero, which is why `isExpired()` in the real client stops returning true the
     * moment it should start. Ported rather than corrected: the views count down from this number
     * and the server is the one that actually refuses a late purchase, so "fixing" it here would
     * only make this client hide a dialog the server still considers live.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::getSecondsRemaining()
    getSecondsRemaining(): number
    {
        const remaining = Math.trunc(((this._expirationTime - performance.now()) / 1000) - TargetedOffer.EXPIRY_GRACE_SECONDS) >>> 0;

        return Math.max(0, remaining);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::checkPurseBalance()
    checkPurseBalance(purse: IHabboCatalogPurse | null, amount: number): boolean
    {
        if(!purse || purse.credits < this._priceInCredits * amount) return false;

        if(purse.getActivityPointsForType(this._activityPointType) < this._priceInActivityPoints * amount) return false;

        return true;
    }

    /**
     * The sub-products' display names, falling back to the raw product code for anything the
     * session's product data does not know.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::getLocalizedSubProductNames()
    getLocalizedSubProductNames(catalog: IHabboCatalog): string[]
    {
        const names: string[] = [];

        for(const code of this._subProductCodes)
        {
            const productData = catalog.getProductData(code);

            names.push(productData ? productData.name : code);
        }

        return names;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get offerId()
    get offerId(): number
    {
        return 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get priceType()
    get priceType(): string
    {
        return '';
    }

    /*
     * The four catalog-page members below answer null in AS3 too, behind non-nullable declared
     * types - AS3 lets any object type hold null, so `get page():_SafeCls_2128 { return null; }`
     * compiles there and does not here. The `null!` keeps both halves of the original: the
     * signature `IPurchasableOffer` requires, and the value the source actually returns.
     *
     * They exist because the source declares them, not because anything reads them: a targeted
     * offer never belongs to a page. The two things that *are* handed this object -
     * `getPriceMap()` and `showPriceInContainer()` - only touch the price members.
     */

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get page()
    get page(): ICatalogPage
    {
        return null!;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::set page()
    set page(_value: ICatalogPage)
    {
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get product()
    get product(): IProduct
    {
        return null!;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return null!;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get gridItem()
    get gridItem(): IGridItem
    {
        return null!;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::set previewCallbackId()
    set previewCallbackId(_value: number)
    {
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get localizationId()
    get localizationId(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get giftable()
    get giftable(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get pricingModel()
    get pricingModel(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get clubLevel()
    get clubLevel(): number
    {
        return 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get localizationName()
    get localizationName(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get localizationDescription()
    get localizationDescription(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get priceInSilver()
    get priceInSilver(): number
    {
        return -1;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/data/TargetedOffer.as::dispose()
    dispose(): void
    {
    }
}
