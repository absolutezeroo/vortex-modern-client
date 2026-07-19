import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Sends a room invite to one or more friends.
 * Sends the recipient count, each recipient ID, then the message.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/SendRoomInviteMessageComposer.as
 */
export class SendRoomInviteMessageComposer implements IMessageComposer<unknown[]>
{
    private _recipientIds: number[];
    private _message: string;

    constructor(recipientIds: number[], message: string)
    {
        this._recipientIds = recipientIds;
        this._message = message;
    }

    get disposed(): boolean
    {
        return false;
    }

    getMessageArray(): unknown[]
    {
        const result: unknown[] = [];
        result.push(this._recipientIds.length);

        for(let i = 0; i < this._recipientIds.length; i++)
        {
            result.push(this._recipientIds[i]);
        }

        result.push(this._message);

        return result;
    }

    dispose(): void
    {
        return;
    }
}
