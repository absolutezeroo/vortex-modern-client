import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for a catalog purchase rejected by server-side rules (error code only).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseNotAllowedMessageEventParser.as
 */
export class PurchaseNotAllowedMessageEventParser implements IMessageParser
{
    private _errorCode: number = 0;

    get errorCode(): number
    {
        return this._errorCode;
    }

    flush(): boolean
    {
        this._errorCode = 0;

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readInt();

        return true;
    }
}
