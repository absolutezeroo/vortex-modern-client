import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubOfferData} from './ClubOfferData';
import {ClubGiftEligibilityData} from './ClubGiftEligibilityData';

/**
 * Parser for the Habbo Club gift/offer info message (club_gifts page + gift-count badge).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/ClubGiftInfoEventParser.as
 */
export class ClubGiftInfoEventParser implements IMessageParser
{
    private _daysUntilNextGift: number = 0;

    get daysUntilNextGift(): number
    {
        return this._daysUntilNextGift;
    }

    private _giftsAvailable: number = 0;

    get giftsAvailable(): number
    {
        return this._giftsAvailable;
    }

    private _offers: ClubOfferData[] = [];

    get offers(): ClubOfferData[]
    {
        return this._offers;
    }

    private _giftData: Map<number, ClubGiftEligibilityData> = new Map();

    get giftData(): Map<number, ClubGiftEligibilityData>
    {
        return this._giftData;
    }

    flush(): boolean
    {
        this._offers = [];
        this._giftData = new Map();

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._daysUntilNextGift = wrapper.readInt();
        this._giftsAvailable = wrapper.readInt();

        const offerCount = wrapper.readInt();

        this._offers = [];

        for(let i = 0; i < offerCount; i++)
        {
            this._offers.push(new ClubOfferData(wrapper));
        }

        const eligibilityCount = wrapper.readInt();

        this._giftData = new Map();

        for(let i = 0; i < eligibilityCount; i++)
        {
            const eligibility = new ClubGiftEligibilityData(wrapper);

            this._giftData.set(eligibility.offerId, eligibility);
        }

        return true;
    }
}
