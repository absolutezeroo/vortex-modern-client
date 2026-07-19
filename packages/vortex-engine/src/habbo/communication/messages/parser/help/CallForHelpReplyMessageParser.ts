import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for call for help reply messages.
 * Contains the response message from staff regarding a CFH ticket.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/CallForHelpReplyMessageEventParser.as
 */
export class CallForHelpReplyMessageParser implements IMessageParser
{
    private _message: string = '';

    get message(): string
    {
        return this._message;
    }

    flush(): boolean
    {
        this._message = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._message = wrapper.readString();

        return true;
    }
}
