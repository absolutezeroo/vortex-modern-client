import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a default sanction for an issue.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/DefaultSanctionMessageComposer.as
 */
export class DefaultSanctionMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(issueId: number, modActionId: number, message: string, cfhTopicId: number = -1)
    {
        super();
        this._data = [issueId, modActionId, message];

        if(cfhTopicId !== -1)
        {
            this._data.push(cfhTopicId);
        }
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
