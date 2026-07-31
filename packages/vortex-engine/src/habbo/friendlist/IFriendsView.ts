/**
 * IFriendsView
 *
 * The friends tab as `FriendCategories` sees it. The domain never touches windows —
 * it calls back through these three when the list changed, when a friend came online
 * with an unread message, and when a refresh has finished.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2269` and no tree recovers
 * it: `win63_version` obfuscates it under a different scheme and the 2016 PRODUCTION
 * build has no equivalent. **The name `IFriendsView` is derived**, from the sole
 * implementor (`FriendsView`, unobfuscated) and from `FriendCategoriesDeps.view`,
 * which resolves it as the tab-1 view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_2269.as
 */
export interface IFriendsView
{
    // AS3: .../_SafeCls_2269.as::refreshList()
    refreshList(): void;

    // AS3: .../_SafeCls_2269.as::setNewMessageArrived()
    setNewMessageArrived(): void;

    // AS3: .../_SafeCls_2269.as::refreshed()
    refreshed(): void;
}
