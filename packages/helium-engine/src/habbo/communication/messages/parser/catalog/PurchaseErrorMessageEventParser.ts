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
