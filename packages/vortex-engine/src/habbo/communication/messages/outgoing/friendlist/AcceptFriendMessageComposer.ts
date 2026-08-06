import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Accepts one or more friend requests.
 * Sends the count followed by each request ID.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer.as
 */
export class AcceptFriendMessageComposer implements IMessageComposer<unknown[]>
{
    private _requestIds: number[];

    constructor(...requestIds: number[])
    {
        this._requestIds = requestIds;
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        const result: unknown[] = [];
        result.push(this._requestIds.length);

        for(let i = 0; i < this._requestIds.length; i++)
        {
            result.push(this._requestIds[i]);
        }

        return result;
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer.as::dispose()
    dispose(): void
    {
        return;
    }
}
