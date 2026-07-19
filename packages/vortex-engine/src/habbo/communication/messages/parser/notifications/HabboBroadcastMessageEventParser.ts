import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for Habbo broadcast message
 *
 * Parses a single broadcast message text string.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/HabboBroadcastMessageEventParser.as
 */
export class HabboBroadcastMessageEventParser implements IMessageParser
{
    private _messageText: string = '';

    get messageText(): string
    {
        return this._messageText;
    }

    flush(): boolean
    {
        this._messageText = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._messageText = wrapper.readString();

        return true;
    }
}
