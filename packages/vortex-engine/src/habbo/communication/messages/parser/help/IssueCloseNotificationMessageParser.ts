import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses issue close notification data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/IssueCloseNotificationMessageEventParser.as
 */
export class IssueCloseNotificationMessageParser implements IMessageParser
{
    private _closeReason: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/IssueCloseNotificationMessageEventParser.as::get closeReason()
    get closeReason(): number
    {
        return this._closeReason;
    }

    private _messageText: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/IssueCloseNotificationMessageEventParser.as::get messageText()
    get messageText(): string
    {
        return this._messageText;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/IssueCloseNotificationMessageEventParser.as::flush()
    flush(): boolean
    {
        this._closeReason = 0;
        this._messageText = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/IssueCloseNotificationMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._closeReason = wrapper.readInt();
        this._messageText = wrapper.readString();
        return true;
    }
}
