import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {IssueInfoData} from './IssueInfoData';

/**
 * Parser for issue pick failed messages.
 * Contains the issues that failed to pick, retry info.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/IssuePickFailedMessageEventParser.as
 */
export class IssuePickFailedMessageParser implements IMessageParser
{
    private _issues: IssueInfoData[] = [];

    get issues(): IssueInfoData[]
    {
        return this._issues;
    }

    private _retryEnabled: boolean = false;

    get retryEnabled(): boolean
    {
        return this._retryEnabled;
    }

    private _retryCount: number = 0;

    get retryCount(): number
    {
        return this._retryCount;
    }

    flush(): boolean
    {
        this._issues = [];
        this._retryEnabled = false;
        this._retryCount = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._issues = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const issueId = wrapper.readInt();
            const pickerUserId = wrapper.readInt();
            const pickerUserName = wrapper.readString();

            const issueData = new IssueInfoData(
                issueId, 0, 0, 0, 0, 0, 0, 0, '', 0, '', pickerUserId, pickerUserName, '', 0, []
            );

            this._issues.push(issueData);
        }

        this._retryEnabled = wrapper.readBoolean();
        this._retryCount = wrapper.readInt();

        return true;
    }
}
