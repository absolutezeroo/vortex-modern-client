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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as
 */
export class ClubBuyOfferData implements IPurchasableOffer, IDisposable
{
    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::_disposed
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

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as
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

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::dispose()
    dispose(): void
    {
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceCredits;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get vip()
    get vip(): boolean
    {
        return this._vip;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get months()
    get months(): number
    {
        return this._months;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get extraDays()
    get extraDays(): number
    {
        return this._extraDays;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get daysLeftAfterPurchase()
    get daysLeftAfterPurchase(): number
    {
        return this._daysLeftAfterPurchase;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get year()
    get year(): number
    {
        return this._year;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get month()
    get month(): number
    {
        return this._month;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get day()
    get day(): number
    {
        return this._day;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get isGiftable()
    get isGiftable(): boolean
    {
        return this._isGiftable;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get page()
    get page(): ICatalogPage
    {
        return this._page;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::set page()
    set page(value: ICatalogPage)
    {
        this._page = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get priceType()
    get priceType(): string
    {
        return 'price_type_credits';
    }

    // AS3 always returns null here (never constructs a real product container for a club/VIP
    // subscription offer) - IPurchasableOffer.productContainer is declared non-null, matching
    // every other real offer type, so this is asserted through rather than widening the shared
    // interface for one implementer.
    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return null as unknown as IProductContainer;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get product()
    get product(): IProduct | null
    {
        return this.productContainer ? this.productContainer.firstProduct : null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get gridItem()
    get gridItem(): IGridItem
    {
        return null as unknown as IGridItem;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get localizationId()
    get localizationId(): string
    {
        return this._productCode;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get upgradeHcPeriodToVip()
    get upgradeHcPeriodToVip(): boolean
    {
        return this._upgradeHcPeriodToVip;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::set upgradeHcPeriodToVip()
    set upgradeHcPeriodToVip(value: boolean)
    {
        this._upgradeHcPeriodToVip = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get giftable()
    get giftable(): boolean
    {
        return this._isGiftable;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get pricingModel()
    get pricingModel(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return this._previewCallbackId;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::set previewCallbackId()
    set previewCallbackId(value: number)
    {
        this._previewCallbackId = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get clubLevel()
    get clubLevel(): number
    {
        return 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get badgeCode()
    get badgeCode(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return '';
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get localizationName()
    get localizationName(): string
    {
        return `\${${this.localizationId}}`;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get localizationDescription()
    get localizationDescription(): string
    {
        return `\${${this.localizationId}}`;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get priceInSilver()
    get priceInSilver(): number
    {
        return -1;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubBuyOfferData.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return 0;
    }
}
