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

    get issueId(): number
    {
        return this._issueId;
    }

    flush(): boolean
    {
        this._issueId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._issueId = parseInt(wrapper.readString());

        return true;
    }
}
