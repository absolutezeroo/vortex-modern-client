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
    private _offer: PurchaseOKMessageOfferData | null = null;

    get offer(): PurchaseOKMessageOfferData | null
    {
        return this._offer;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offer = new PurchaseOKMessageOfferData(wrapper);

        return true;
    }
}
