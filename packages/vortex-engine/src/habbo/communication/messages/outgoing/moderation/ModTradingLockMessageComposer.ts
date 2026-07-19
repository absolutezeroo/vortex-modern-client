import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a moderator trading lock action for a user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModTradingLockMessageComposer.as
 */
export class ModTradingLockMessageComposer extends MessageComposer<unknown[]>
{
    public static readonly NO_ISSUE: number = -1;

    private _data: unknown[];

    constructor(userId: number, message: string, durationInMinutes: number, cfhTopic: number, cfhTopicId: number = -1)
    {
        super();
        this._data = [userId, message, durationInMinutes, cfhTopic];

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
