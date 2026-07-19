import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for call for help result messages.
 * Contains the result type and message text for a submitted CFH ticket.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/CallForHelpResultMessageEventParser.as
 */
export class CallForHelpResultMessageParser implements IMessageParser
{
    private _resultType: number = -1;

    get resultType(): number
    {
        return this._resultType;
    }

    private _messageText: string = '';

    get messageText(): string
    {
        return this._messageText;
    }

    flush(): boolean
    {
        this._resultType = -1;
        this._messageText = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultType = wrapper.readInt();
        this._messageText = wrapper.readString();

        return true;
    }
}
