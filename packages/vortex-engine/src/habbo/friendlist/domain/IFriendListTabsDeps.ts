import type {HabboFriendList} from '../HabboFriendList';

/**
 * IFriendListTabsDeps
 *
 * What `FriendListTabs` needs to build its three tabs: the manager each tab view is
 * initialised with, and the current window height it sizes the open tab against.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2014` and no tree recovers
 * it. **The name `IFriendListTabsDeps` is derived**, from its sole implementor
 * `FriendListTabsDeps` (unobfuscated).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/_SafeCls_2014.as
 */
export interface IFriendListTabsDeps
{
    // AS3: .../domain/_SafeCls_2014.as::getFriendList()
    getFriendList(): HabboFriendList;

    // AS3: .../domain/_SafeCls_2014.as::getWindowHeight()
    getWindowHeight(): number;
}
