import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Releases (unclaims) one or more issues.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ReleaseIssuesMessageComposer.as
 */
export class ReleaseIssuesMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(issueIds: number[])
    {
        super();
        this._data = [];
        this._data.push(issueIds.length);

        for(const issueId of issueIds)
        {
            this._data.push(issueId);
        }
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
