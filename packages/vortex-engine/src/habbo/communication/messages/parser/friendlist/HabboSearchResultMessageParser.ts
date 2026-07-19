import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {HabboSearchResultData} from './HabboSearchResultData';

/**
 * Parser for Habbo user search results.
 * Contains two lists: friends matching the search and other users matching the search.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/HabboSearchResultMessageParser.as
 */
export class HabboSearchResultMessageParser implements IMessageParser
{
    private _friends: HabboSearchResultData[] = [];

    get friends(): HabboSearchResultData[]
    {
        return this._friends;
    }

    private _others: HabboSearchResultData[] = [];

    get others(): HabboSearchResultData[]
    {
        return this._others;
    }

    flush(): boolean
    {
        this._friends = [];
        this._others = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const friendCount = wrapper.readInt();

        for(let i = 0; i < friendCount; i++)
        {
            this._friends.push(new HabboSearchResultData(wrapper));
        }

        const otherCount = wrapper.readInt();

        for(let i = 0; i < otherCount; i++)
        {
            this._others.push(new HabboSearchResultData(wrapper));
        }

        return true;
    }
}
