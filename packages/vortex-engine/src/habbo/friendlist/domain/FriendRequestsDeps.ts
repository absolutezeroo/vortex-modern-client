import {FriendListTabEnum} from '../FriendListTabEnum';
import type {IFriendRequestsView} from '../IFriendRequestsView';
import type {HabboFriendList} from '../HabboFriendList';
import type {IFriendRequestsDeps} from './IFriendRequestsDeps';

/**
 * FriendRequestsDeps
 *
 * Resolves the requests tab's view off the manager on each access — null until the
 * tabs exist, which is why the domain null-checks it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendRequestsDeps.as
 */
export class FriendRequestsDeps implements IFriendRequestsDeps
{
    // AS3: .../domain/FriendRequestsDeps.as::FriendRequestsDeps()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../domain/FriendRequestsDeps.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../domain/FriendRequestsDeps.as::get view()
    get view(): IFriendRequestsView | null
    {
        const tabView = this._friendList.tabs?.findTab(FriendListTabEnum.TABID_FRIEND_REQUESTS)?.tabView ?? null;

        return tabView as unknown as IFriendRequestsView | null;
    }
}
