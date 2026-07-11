import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogPage} from '../viewer/ICatalogPage';
import type {IProduct} from '../viewer/IProduct';
import type {IProductContainer} from '../viewer/IProductContainer';
import type {IGridItem} from '../viewer/IGridItem';

/**
 * A single Habbo Club/VIP subscription purchase offer (buy-days catalog entry).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as
 */
export class ClubBuyOfferData implements IPurchasableOffer, IDisposable
{
    private _disposed: boolean = false;

    private _page: ICatalogPage = null!;

    private _upgradeHcPeriodToVip: boolean = false;

    private _previewCallbackId: number = 0;

    constructor(
        private readonly _offerId: number,
        private readonly _productCode: string,
        private readonly _priceCredits: number,
        private readonly _priceInActivityPoints: number,
        private readonly _activityPointType: number,
        private readonly _vip: boolean,
        private readonly _months: number,
        private readonly _extraDays: number,
        private readonly _daysLeftAfterPurchase: number,
        private readonly _year: number,
        private readonly _month: number,
        private readonly _day: number,
        private readonly _isGiftable: boolean = false
    )
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as
    // Reads the raw wire-DTO fields directly into the real, named data class (the AS3 parser
    // wraps an intermediate per-offer struct whose own class name is unrecoverable in all three
    // source trees - obfuscated _SafeCls_3272 in the primary tree, generic class_2374 in the
    // secondary tree, absent from the tertiary tree - so this port skips the unnamed middleman).
    // Field order matches the wire exactly: it does NOT match ClubBuyOfferData's own constructor
    // parameter order (isGiftable is read here right after extraDays, not last).
    static fromWrapper(wrapper: IMessageDataWrapper): ClubBuyOfferData
    {
        const offerId = wrapper.readInt();
        const productCode = wrapper.readString();

        wrapper.readBoolean();

        const priceCredits = wrapper.readInt();
        const priceInActivityPoints = wrapper.readInt();
        const activityPointType = wrapper.readInt();
        const vip = wrapper.readBoolean();
        const months = wrapper.readInt();
        const extraDays = wrapper.readInt();
        const isGiftable = wrapper.readBoolean();
        const daysLeftAfterPurchase = wrapper.readInt();
        const year = wrapper.readInt();
        const month = wrapper.readInt();
        const day = wrapper.readInt();

        return new ClubBuyOfferData(
            offerId, productCode, priceCredits, priceInActivityPoints, activityPointType,
            vip, months, extraDays, daysLeftAfterPurchase, year, month, day, isGiftable
        );
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    dispose(): void
    {
        this._disposed = true;
    }

    get offerId(): number
    {
        return this._offerId;
    }

    get productCode(): string
    {
        return this._productCode;
    }

    get priceInCredits(): number
    {
        return this._priceCredits;
    }

    get vip(): boolean
    {
        return this._vip;
    }

    get months(): number
    {
        return this._months;
    }

    get extraDays(): number
    {
        return this._extraDays;
    }

    get daysLeftAfterPurchase(): number
    {
        return this._daysLeftAfterPurchase;
    }

    get year(): number
    {
        return this._year;
    }

    get month(): number
    {
        return this._month;
    }

    get day(): number
    {
        return this._day;
    }

    get isGiftable(): boolean
    {
        return this._isGiftable;
    }

    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    get activityPointType(): number
    {
        return this._activityPointType;
    }

    get page(): ICatalogPage
    {
        return this._page;
    }

    set page(value: ICatalogPage)
    {
        this._page = value;
    }

    get priceType(): string
    {
        return 'price_type_credits';
    }

    // AS3 always returns null here (never constructs a real product container for a club/VIP
    // subscription offer) - IPurchasableOffer.productContainer is declared non-null, matching
    // every other real offer type, so this is asserted through rather than widening the shared
    // interface for one implementer.
    get productContainer(): IProductContainer
    {
        return null as unknown as IProductContainer;
    }

    get product(): IProduct | null
    {
        return this.productContainer ? this.productContainer.firstProduct : null;
    }

    get gridItem(): IGridItem
    {
        return null as unknown as IGridItem;
    }

    get localizationId(): string
    {
        return this._productCode;
    }

    get upgradeHcPeriodToVip(): boolean
    {
        return this._upgradeHcPeriodToVip;
    }

    set upgradeHcPeriodToVip(value: boolean)
    {
        this._upgradeHcPeriodToVip = value;
    }

    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    get isRentOffer(): boolean
    {
        return false;
    }

    get giftable(): boolean
    {
        return this._isGiftable;
    }

    get pricingModel(): string
    {
        return '';
    }

    get previewCallbackId(): number
    {
        return this._previewCallbackId;
    }

    set previewCallbackId(value: number)
    {
        this._previewCallbackId = value;
    }

    get clubLevel(): number
    {
        return 0;
    }

    get badgeCode(): string
    {
        return '';
    }

    get extraChatStyleCode(): string
    {
        return '';
    }

    get isSingleChatStyle(): boolean
    {
        return false;
    }

    get localizationName(): string
    {
        return `\${${this.localizationId}}`;
    }

    get localizationDescription(): string
    {
        return `\${${this.localizationId}}`;
    }

    get priceInSilver(): number
    {
        return -1;
    }

    get priceInEmerald(): number
    {
        return 0;
    }
}
