/**
 * Data for one row of the bundle-purchase "extra info" display (promo/discount/bonus badge).
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as
 */
export class ExtraInfoItemData
{
    static readonly TYPE_PROMO: number = 0;

    static readonly TYPE_BONUS_BADGE: number = 3;

    static readonly TYPE_RESET_MESSAGE: number = 5;

    private _type: number;

    private _text: string;

    private _quantity: number = 0;

    private _activityPointType: number = 0;

    private _discountPriceCredits: number = 0;

    private _discountPriceActivityPoints: number = 0;

    private _priceCredits: number = 0;

    private _priceActivityPoints: number = 0;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::_priceSilver
    // Silver-currency field present in win63 but not in the older vortex-client reference.
    private _priceSilver: number = 0;

    private _badgeCode: string | null = null;

    private _achievementCode: string | null = null;

    constructor(type: number, text: string = '')
    {
        this._type = type;
        this._text = text;
    }

    get type(): number
    {
        return this._type;
    }

    get text(): string
    {
        return this._text;
    }

    set text(value: string)
    {
        this._text = value;
    }

    get quantity(): number
    {
        return this._quantity;
    }

    set quantity(value: number)
    {
        this._quantity = value;
    }

    get activityPointType(): number
    {
        return this._activityPointType;
    }

    set activityPointType(value: number)
    {
        this._activityPointType = value;
    }

    get discountPriceCredits(): number
    {
        return this._discountPriceCredits;
    }

    set discountPriceCredits(value: number)
    {
        this._discountPriceCredits = value;
    }

    get discountPriceActivityPoints(): number
    {
        return this._discountPriceActivityPoints;
    }

    set discountPriceActivityPoints(value: number)
    {
        this._discountPriceActivityPoints = value;
    }

    get priceCredits(): number
    {
        return this._priceCredits;
    }

    set priceCredits(value: number)
    {
        this._priceCredits = value;
    }

    get priceActivityPoints(): number
    {
        return this._priceActivityPoints;
    }

    set priceActivityPoints(value: number)
    {
        this._priceActivityPoints = value;
    }

    get priceSilver(): number
    {
        return this._priceSilver;
    }

    set priceSilver(value: number)
    {
        this._priceSilver = value;
    }

    get badgeCode(): string | null
    {
        return this._badgeCode;
    }

    set badgeCode(value: string | null)
    {
        this._badgeCode = value;
    }

    get achievementCode(): string | null
    {
        return this._achievementCode;
    }

    set achievementCode(value: string | null)
    {
        this._achievementCode = value;
    }
}
