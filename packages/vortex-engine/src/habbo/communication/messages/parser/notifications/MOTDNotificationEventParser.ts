import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for Message of the Day notification
 *
 * Parses a list of strings representing the MOTD lines.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/MOTDNotificationEventParser.as
 */
export class MOTDNotificationEventParser implements IMessageParser
{
    private _messages: string[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/MOTDNotificationEventParser.as::get messages()
    get messages(): string[]
    {
        return this._messages;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/MOTDNotificationEventParser.as::flush()
    flush(): boolean
    {
        this._messages = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/MOTDNotificationEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._messages.push(wrapper.readString());
        }

        return true;
    }
}
