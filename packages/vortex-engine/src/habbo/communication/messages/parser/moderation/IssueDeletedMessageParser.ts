import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for issue deleted messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/IssueDeletedMessageEventParser.as
 */
export class IssueDeletedMessageParser implements IMessageParser
{
    private _issueId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/IssueDeletedMessageEventParser.as::get issueId()
    get issueId(): number
    {
        return this._issueId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/IssueDeletedMessageEventParser.as::flush()
    flush(): boolean
    {
        this._issueId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/IssueDeletedMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._issueId = parseInt(wrapper.readString());

        return true;
    }
}
