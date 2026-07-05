import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for messenger error messages.
 * Contains the client message ID and an error code.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/MessengerErrorMessageParser.as
 */
export class MessengerErrorMessageParser implements IMessageParser
{
    private _clientMessageId: number = 0;

    get clientMessageId(): number
    {
        return this._clientMessageId;
    }

    private _errorCode: number = 0;

    get errorCode(): number
    {
        return this._errorCode;
    }

    flush(): boolean
    {
        this._clientMessageId = 0;
        this._errorCode = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._clientMessageId = wrapper.readInt();
        this._errorCode = wrapper.readInt();

        return true;
    }
}
