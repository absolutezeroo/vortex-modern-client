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

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseNotAllowedMessageEventParser.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseNotAllowedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._errorCode = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseNotAllowedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readInt();

        return true;
    }
}
