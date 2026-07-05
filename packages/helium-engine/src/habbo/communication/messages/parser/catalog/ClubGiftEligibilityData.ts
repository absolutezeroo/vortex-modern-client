import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Gift eligibility entry for a single offer (VIP-only, days-required gating).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2368.as
 */
export class ClubGiftEligibilityData
{
    private _offerId: number = 0;

    get offerId(): number
    {
        return this._offerId;
    }

    private _isVip: boolean = false;

    get isVip(): boolean
    {
        return this._isVip;
    }

    private _daysRequired: number = 0;

    get daysRequired(): number
    {
        return this._daysRequired;
    }

    private _isSelectable: boolean = false;

    get isSelectable(): boolean
    {
        return this._isSelectable;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._isVip = wrapper.readBoolean();
        this._daysRequired = wrapper.readInt();
        this._isSelectable = wrapper.readBoolean();
    }
}
