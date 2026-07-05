import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FriendRequestData} from './FriendRequestData';

/**
 * Parser for friend requests list message.
 * Contains the total request count and the list of friend request data.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FriendRequestsMessageParser.as
 */
export class FriendRequestsMessageParser implements IMessageParser
{
    private _totalReqCount: number = 0;

    get totalReqCount(): number
    {
        return this._totalReqCount;
    }

    private _reqs: FriendRequestData[] = [];

    get reqs(): FriendRequestData[]
    {
        return this._reqs;
    }

    flush(): boolean
    {
        this._totalReqCount = 0;
        this._reqs = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._totalReqCount = wrapper.readInt();

        const displayCount = wrapper.readInt();

        for(let i = 0; i < displayCount; i++)
        {
            this._reqs.push(new FriendRequestData(wrapper));
        }

        return true;
    }
}
