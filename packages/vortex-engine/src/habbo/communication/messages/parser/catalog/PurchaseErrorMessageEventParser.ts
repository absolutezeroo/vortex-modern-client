import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for a generic catalog purchase failure (error code only).
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseErrorMessageEventParser.as
 */
export class PurchaseErrorMessageEventParser implements IMessageParser
{
    private _errorCode: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseErrorMessageEventParser.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseErrorMessageEventParser.as::flush()
    flush(): boolean
    {
        this._errorCode = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/PurchaseErrorMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readInt();

        return true;
    }
}
