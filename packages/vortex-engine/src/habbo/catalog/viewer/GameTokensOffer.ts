import type {ICatalogPage} from './ICatalogPage';
import type {IProduct} from './IProduct';
import type {IProductContainer} from './IProductContainer';
import type {IGridItem} from './IGridItem';
import type {IPurchasableOffer} from '../IPurchasableOffer';

/**
 * Presents a snow-war token bundle as something `HabboCatalog.showPurchaseConfirmation()` will
 * accept.
 *
 * It is an offer with no page, no product and no grid item — the bundles are not catalog entries
 * at all, they arrive on their own message and are shown by the snow-war lobby. Almost every
 * getter is therefore a constant, and the confirmation dialog is written to cope with that.
 *
 * The one behaviour it drives from outside itself is in `HabboCatalog.showPurchaseConfirmation()`,
 * which skips both balance tests for this class: a token bundle can be bought with activity points
 * the credit test would reject.
 *
 * Note `localizationName` and `localizationDescription`: both are the *same* key, wrapped for the
 * localization manager. AS3 has no separate description for a token bundle.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/GameTokensOffer.as
 */
export class GameTokensOffer implements IPurchasableOffer
{
    // AS3: GameTokensOffer.as::_offerId
    private _offerId: number;

    // AS3: GameTokensOffer.as::_localizationId (from `get localizationId()`)
    private _localizationId: string;

    // AS3: GameTokensOffer.as::_priceInCredits (from `get priceInCredits()`)
    private _priceInCredits: number;

    // AS3: GameTokensOffer.as::_priceInActivityPoints (from `get priceInActivityPoints()`)
    private _priceInActivityPoints: number;

    // AS3: GameTokensOffer.as::_activityPointType (from `get activityPointType()`)
    private _activityPointType: number;

    // AS3: GameTokensOffer.as::GameTokensOffer()
    constructor(
        offerId: number,
        localizationId: string,
        priceInCredits: number,
        priceInActivityPoints: number,
        activityPointType: number
    )
    {
        this._offerId = offerId;
        this._localizationId = localizationId;
        this._priceInCredits = priceInCredits;
        this._priceInActivityPoints = priceInActivityPoints;
        this._activityPointType = activityPointType;
    }

    // AS3: GameTokensOffer.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: GameTokensOffer.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: GameTokensOffer.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: GameTokensOffer.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    // AS3: GameTokensOffer.as::get priceInSilver()
    // -1, not 0: silver is "not applicable" here, and the dialog tells the two apart.
    get priceInSilver(): number
    {
        return -1;
    }

    // AS3: GameTokensOffer.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return 0;
    }

    // AS3: GameTokensOffer.as::get page()
    get page(): ICatalogPage
    {
        return null as unknown as ICatalogPage;
    }

    // AS3: GameTokensOffer.as::set page()
    set page(_value: ICatalogPage)
    {
    }

    // AS3: GameTokensOffer.as::get priceType()
    get priceType(): string
    {
        return 'price_type_credits';
    }

    // AS3: GameTokensOffer.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return null as unknown as IProductContainer;
    }

    // AS3: GameTokensOffer.as::get product()
    get product(): IProduct | null
    {
        return this.productContainer ? this.productContainer.firstProduct : null;
    }

    // AS3: GameTokensOffer.as::get gridItem()
    get gridItem(): IGridItem
    {
        return null as unknown as IGridItem;
    }

    // AS3: GameTokensOffer.as::get localizationId()
    get localizationId(): string
    {
        return this._localizationId;
    }

    // AS3: GameTokensOffer.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    // AS3: GameTokensOffer.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return false;
    }

    // AS3: GameTokensOffer.as::get giftable()
    get giftable(): boolean
    {
        return false;
    }

    // AS3: GameTokensOffer.as::get pricingModel()
    get pricingModel(): string
    {
        return '';
    }

    // AS3: GameTokensOffer.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return 0;
    }

    // AS3: GameTokensOffer.as::set previewCallbackId()
    set previewCallbackId(_value: number)
    {
    }

    // AS3: GameTokensOffer.as::get clubLevel()
    get clubLevel(): number
    {
        return 0;
    }

    // AS3: GameTokensOffer.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: GameTokensOffer.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return '';
    }

    // AS3: GameTokensOffer.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return false;
    }

    // AS3: GameTokensOffer.as::get localizationName()
    get localizationName(): string
    {
        return '${' + this.localizationId + '}';
    }

    // AS3: GameTokensOffer.as::get localizationDescription()
    get localizationDescription(): string
    {
        return '${' + this.localizationId + '}';
    }

    // AS3: GameTokensOffer.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }

    // AS3: GameTokensOffer.as::dispose()
    dispose(): void
    {
    }
}
