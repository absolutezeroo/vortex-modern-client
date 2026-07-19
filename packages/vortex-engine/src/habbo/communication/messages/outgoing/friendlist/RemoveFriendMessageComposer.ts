import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Removes one or more friends from the friend list.
 * Sends the count followed by each friend ID.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/RemoveFriendMessageComposer.as
 */
export class RemoveFriendMessageComposer implements IMessageComposer<unknown[]>
{
    private _friendIds: number[];

    constructor(...friendIds: number[])
    {
        this._friendIds = friendIds;
    }

    get disposed(): boolean
    {
        return false;
    }

    getMessageArray(): unknown[]
    {
        const result: unknown[] = [];
        result.push(this._friendIds.length);

        for(let i = 0; i < this._friendIds.length; i++)
        {
            result.push(this._friendIds[i]);
        }

        return result;
    }

    dispose(): void
    {
        return;
    }
}
