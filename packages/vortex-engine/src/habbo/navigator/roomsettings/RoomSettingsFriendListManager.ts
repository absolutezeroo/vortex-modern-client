import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {
    FriendListFragmentMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListFragmentMessageEvent';
import type {
    FriendListUpdateMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListUpdateMessageEvent';
import type {
    FriendListFragmentMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendListFragmentMessageParser';
import type {
    FriendListUpdateMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendListUpdateMessageParser';
import {FriendEntryData} from './FriendEntryData';

/**
 * Manages the friend list data for room settings (e.g. flat controller assignment).
 * Listens for friend list fragment and update events, maintains a cached sorted list.
 *
 * @see source_as_win63/habbo/navigator/roomsettings/class_3637.as
 */
export class RoomSettingsFriendListManager
{
    private _friendMap: Map<number, string> = new Map();
    private _cachedList: FriendEntryData[] | null = null;

    /**
	 * Get the sorted friend list. Lazily built and cached until invalidated.
	 */
    get list(): FriendEntryData[]
    {
        if(this._cachedList === null)
        {
            this._cachedList = [];

            for(const [userId, userName] of this._friendMap)
            {
                this._cachedList.push(new FriendEntryData(userId, userName));
            }

            this._cachedList.sort((a, b) => a.userName.localeCompare(b.userName));
        }

        return this._cachedList;
    }

    /**
	 * Handle a friend list fragment message. Populates the friend map.
	 */
    onFriendsListFragment(event: IMessageEvent): void
    {
        const parser = (event as FriendListFragmentMessageEvent).parser as FriendListFragmentMessageParser;

        if(!parser)
        {
            return;
        }

        for(const friend of parser.friendFragment)
        {
            this._friendMap.set(friend.id, friend.name);
        }
    }

    /**
	 * Handle a friend list update message. Processes removals and additions.
	 */
    onFriendListUpdate(event: IMessageEvent): void
    {
        const parser = (event as FriendListUpdateMessageEvent).parser as FriendListUpdateMessageParser;

        for(const removedId of parser.removedFriendIds)
        {
            this._friendMap.delete(removedId);
        }

        for(const addedFriend of parser.addedFriends)
        {
            this._friendMap.set(addedFriend.id, addedFriend.name);
        }

        if(parser.removedFriendIds.length > 0 || parser.addedFriends.length > 0)
        {
            this._cachedList = null;
        }
    }
}
