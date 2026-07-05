import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Picks (claims) one or more issues for moderation.
 * Sends issue count, each issue ID, retry flag, retry count, and picker name.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/PickIssuesMessageComposer.as
 */
export class PickIssuesMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(issueIds: number[], retryEnabled: boolean, retryCount: number, pickerName: string)
    {
        super();
        this._data = [];
        this._data.push(issueIds.length);

        for(const issueId of issueIds)
        {
            this._data.push(issueId);
        }

        this._data.push(retryEnabled);
        this._data.push(retryCount);
        this._data.push(pickerName);
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
