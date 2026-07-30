import type {IFriendRequestsView} from '../IFriendRequestsView';

/**
 * IFriendRequestsDeps
 *
 * The one thing `FriendRequests` needs: its tab's view, resolved on each access
 * because the tab is rebuilt whenever the window reopens.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2161` and no tree recovers
 * it. **The name `IFriendRequestsDeps` is derived**, from its sole implementor
 * `FriendRequestsDeps` (unobfuscated).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/_SafeCls_2161.as
 */
export interface IFriendRequestsDeps
{
    // AS3: .../domain/_SafeCls_2161.as::get view()
    readonly view: IFriendRequestsView | null;
}
