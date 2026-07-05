import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for generic error messages
 * Message ID: 598
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/GenericErrorEventParser.as
 */
export class GenericErrorMessageParser implements IMessageParser
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
        if(wrapper.bytesAvailable >= 4)
        {
            this._errorCode = wrapper.readInt();
        }
        return true;
    }
}
