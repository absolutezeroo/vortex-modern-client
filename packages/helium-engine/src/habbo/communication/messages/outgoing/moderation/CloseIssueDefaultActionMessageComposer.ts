import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Closes issues with a default action and sanction.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/CloseIssueDefaultActionMessageComposer.as
 */
export class CloseIssueDefaultActionMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(issueId: number, issueIds: number[], sanctionTypeId: number)
    {
        super();
        this._data = [];
        this._data.push(issueId);
        this._data.push(issueIds.length);

        for(const id of issueIds)
        {
            this._data.push(id);
        }

        this._data.push(sanctionTypeId);
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
