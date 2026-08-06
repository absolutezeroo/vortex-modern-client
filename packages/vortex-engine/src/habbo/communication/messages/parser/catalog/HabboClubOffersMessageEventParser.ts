import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubBuyOfferData} from '@habbo/catalog/club/ClubBuyOfferData';

/**
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as
 */
export class HabboClubOffersMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as::_offers
    private _offers: ClubBuyOfferData[] = [];

    private _source: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as::get offers()
    get offers(): ClubBuyOfferData[]
    {
        return this._offers;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as::get source()
    get source(): number
    {
        return this._source;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as::flush()
    flush(): boolean
    {
        this._offers = [];

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubOffersMessageEventParser.as::parse()
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
