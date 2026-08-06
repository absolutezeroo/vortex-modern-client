import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubExtendOfferData} from '@habbo/catalog/club/ClubExtendOfferData';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser.as
 */
export class HabboClubExtendOfferMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser.as::_offer
    private _offer: ClubExtendOfferData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser.as::flush()
    flush(): boolean
    {
        this._offer = null;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offer = ClubExtendOfferData.fromWrapper(wrapper);

        return true;
    }

    // AS3 exposes this as a method (offer()), not a property getter - kept faithful since callers
    // (ClubExtendController.onOffer()) invoke it as such.
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser.as::offer()
    offer(): ClubExtendOfferData | null
    {
        return this._offer;
    }
}
