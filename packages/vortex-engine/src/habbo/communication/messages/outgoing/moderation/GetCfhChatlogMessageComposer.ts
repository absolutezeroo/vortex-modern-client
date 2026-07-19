import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the chatlog for a specific CFH (Call For Help) issue.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetCfhChatlogMessageComposer.as
 */
export class GetCfhChatlogMessageComposer extends MessageComposer<ConstructorParameters<typeof GetCfhChatlogMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCfhChatlogMessageComposer>;

    constructor(issueId: number)
    {
        super();
        this._data = [issueId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
