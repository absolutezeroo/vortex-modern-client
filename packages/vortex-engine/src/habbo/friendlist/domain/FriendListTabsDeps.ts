import type {HabboFriendList} from '../HabboFriendList';
import type {IFriendListTabsDeps} from './IFriendListTabsDeps';

/**
 * FriendListTabsDeps
 *
 * Hands `FriendListTabs` the manager its tab views are initialised with, and the live
 * window height they size themselves against.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendListTabsDeps.as
 */
export class FriendListTabsDeps implements IFriendListTabsDeps
{
    // AS3: .../domain/FriendListTabsDeps.as::FriendListTabsDeps()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../domain/FriendListTabsDeps.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../domain/FriendListTabsDeps.as::getFriendList()
    getFriendList(): HabboFriendList
    {
        return this._friendList;
    }

    // AS3: .../domain/FriendListTabsDeps.as::getWindowHeight()
    getWindowHeight(): number
    {
        return this._friendList.view?.mainWindow?.height ?? 0;
    }
}
