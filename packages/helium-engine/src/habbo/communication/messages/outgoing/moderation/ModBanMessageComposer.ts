import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a moderator ban action for a user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModBanMessageComposer.as
 */
export class ModBanMessageComposer extends MessageComposer<unknown[]>
{
    public static readonly NO_ISSUE: number = -1;

    private _data: unknown[];

    constructor(userId: number, message: string, cfhTopic: number, banDurationInHours: number, banMachine: boolean, cfhTopicId: number = -1)
    {
        super();
        this._data = [userId, message, cfhTopic, banDurationInHours, banMachine];

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
