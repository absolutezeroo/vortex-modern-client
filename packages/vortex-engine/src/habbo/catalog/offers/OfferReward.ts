/**
 * One payout in the offer centre's list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/OfferReward.as
 */
export class OfferReward
{
    // AS3: OfferReward.as::_name
    private _name: string;

    // AS3: OfferReward.as::_SafeStr_8064 (backing field of contentType)
    private _contentType: string;

    // AS3: OfferReward.as::_SafeStr_5613 (backing field of classId)
    private _classId: number;

    // AS3: OfferReward.as::OfferReward()
    constructor(name: string, contentType: string, classId: number)
    {
        this._name = name;
        this._contentType = contentType;
        this._classId = classId;
    }

    // AS3: OfferReward.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: OfferReward.as::get contentType()
    get contentType(): string
    {
        return this._contentType;
    }

    // AS3: OfferReward.as::get classId()
    get classId(): number
    {
        return this._classId;
    }
}
