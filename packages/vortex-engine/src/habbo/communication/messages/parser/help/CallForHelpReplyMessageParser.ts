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

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/CallForHelpReplyMessageEventParser.as::get message()
    get message(): string
    {
        return this._message;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/CallForHelpReplyMessageEventParser.as::flush()
    flush(): boolean
    {
        this._message = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/CallForHelpReplyMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._message = wrapper.readString();

        return true;
    }
}
