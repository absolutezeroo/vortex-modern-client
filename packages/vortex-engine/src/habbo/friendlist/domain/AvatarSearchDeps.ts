import {FriendListTabEnum} from '../FriendListTabEnum';
import type {ISearchView} from '../ISearchView';
import type {HabboFriendList} from '../HabboFriendList';
import type {IAvatarSearchDeps} from './IAvatarSearchDeps';

/**
 * AvatarSearchDeps
 *
 * Resolves the search tab's view off the manager on each access.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/AvatarSearchDeps.as
 */
export class AvatarSearchDeps implements IAvatarSearchDeps
{
    // AS3: .../domain/AvatarSearchDeps.as::AvatarSearchDeps()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../domain/AvatarSearchDeps.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../domain/AvatarSearchDeps.as::get view()
    get view(): ISearchView
    {
        return this._friendList.tabs?.findTab(FriendListTabEnum.TABID_SEARCH)?.tabView as unknown as ISearchView;
    }
}
