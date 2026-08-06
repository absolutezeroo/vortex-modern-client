import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PurchaseOKMessageOfferData} from '../../incoming/catalog/PurchaseOKMessageOfferData';

/**
 * Parser for a successful catalog purchase confirmation.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser.as
 */
export class PurchaseOKMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser.as::_offer
    private _offer: PurchaseOKMessageOfferData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser.as::get offer()
    get offer(): PurchaseOKMessageOfferData | null
    {
        return this._offer;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseOKMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offer = new PurchaseOKMessageOfferData(wrapper);

        return true;
    }
}
