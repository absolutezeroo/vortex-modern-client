/**
 * Data for one row of the bundle-purchase "extra info" display (promo/discount/bonus badge).
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as
 */
export class ExtraInfoItemData
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::TYPE_PROMO
    static readonly TYPE_PROMO: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::TYPE_BUNDLES_INFO_SCREEN
    static readonly TYPE_BUNDLES_INFO_SCREEN: number = 1;

    // TS-only names: the real AS3 identifiers for type values 2 and 4 are unrecoverable (generic
    // decompiler names in all three source trees - _SafeStr_11302/const_211/_Str_14097 for 2,
    // _SafeStr_11722/const_501/_Str_18371 for 4). Derived from ExtraInfoViewManager.as::addItem()'s
    // switch, which unambiguously maps 2 -> ExtraInfoDiscountValueItem and 4 -> ExtraInfoBonusAchievementItem.
    static readonly TYPE_DISCOUNT_VALUE: number = 2;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::TYPE_BONUS_BADGE
    static readonly TYPE_BONUS_BADGE: number = 3;

    static readonly TYPE_BONUS_ACHIEVEMENT: number = 4;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::TYPE_RESET_MESSAGE
    static readonly TYPE_RESET_MESSAGE: number = 5;

    private _type: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::_text
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get text()
    get text(): string
    {
        return this._text;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set text()
    set text(value: string)
    {
        this._text = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get quantity()
    get quantity(): number
    {
        return this._quantity;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set quantity()
    set quantity(value: number)
    {
        this._quantity = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set activityPointType()
    set activityPointType(value: number)
    {
        this._activityPointType = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get discountPriceCredits()
    get discountPriceCredits(): number
    {
        return this._discountPriceCredits;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set discountPriceCredits()
    set discountPriceCredits(value: number)
    {
        this._discountPriceCredits = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get discountPriceActivityPoints()
    get discountPriceActivityPoints(): number
    {
        return this._discountPriceActivityPoints;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set discountPriceActivityPoints()
    set discountPriceActivityPoints(value: number)
    {
        this._discountPriceActivityPoints = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get priceCredits()
    get priceCredits(): number
    {
        return this._priceCredits;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set priceCredits()
    set priceCredits(value: number)
    {
        this._priceCredits = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get priceActivityPoints()
    get priceActivityPoints(): number
    {
        return this._priceActivityPoints;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set priceActivityPoints()
    set priceActivityPoints(value: number)
    {
        this._priceActivityPoints = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get priceSilver()
    get priceSilver(): number
    {
        return this._priceSilver;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set priceSilver()
    set priceSilver(value: number)
    {
        this._priceSilver = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get badgeCode()
    get badgeCode(): string | null
    {
        return this._badgeCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set badgeCode()
    set badgeCode(value: string | null)
    {
        this._badgeCode = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::get achievementCode()
    get achievementCode(): string | null
    {
        return this._achievementCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/ExtraInfoItemData.as::set achievementCode()
    set achievementCode(value: string | null)
    {
        this._achievementCode = value;
    }
}
