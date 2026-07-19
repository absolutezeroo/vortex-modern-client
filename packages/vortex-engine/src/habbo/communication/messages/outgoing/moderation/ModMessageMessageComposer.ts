import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a moderator message to a user (with empty placeholders for compatibility).
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModMessageMessageComposer.as
 */
export class ModMessageMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(userId: number, message: string, cfhTopic: number, cfhTopicId: number = -1)
    {
        super();
        this._data = [userId, message, '', '', cfhTopic];

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
