import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubBuyOfferData} from '@habbo/catalog/club/ClubBuyOfferData';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as
 */
export class HabboClubOffersMessageEventParser implements IMessageParser
{
    private _offers: ClubBuyOfferData[] = [];

    private _source: number = 0;

    get offers(): ClubBuyOfferData[]
    {
        return this._offers;
    }

    get source(): number
    {
        return this._source;
    }

    flush(): boolean
    {
        this._offers = [];

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._offers.push(ClubBuyOfferData.fromWrapper(wrapper));
        }

        this._source = wrapper.readInt();

        return true;
    }
}
