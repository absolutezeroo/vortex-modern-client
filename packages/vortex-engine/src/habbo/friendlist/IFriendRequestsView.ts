import type {FriendRequest} from './domain/FriendRequest';

/**
 * IFriendRequestsView
 *
 * The friend-requests tab as `FriendRequests` sees it: per-row repaints, add/remove,
 * and the four accept/decline entry points the footer buttons and the domain share.
 *
 * The primary tree obfuscates this interface to `_SafeCls_1935` and no tree recovers
 * it. **The name `IFriendRequestsView` is derived**, from its member set and from
 * `FriendRequestsDeps.view`, which resolves it as the tab-2 view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_1935.as
 */
export interface IFriendRequestsView
{
    // AS3: .../_SafeCls_1935.as::refreshShading()
    refreshShading(request: FriendRequest, shaded: boolean): void;

    // AS3: .../_SafeCls_1935.as::refreshRequestEntry()
    refreshRequestEntry(request: FriendRequest): void;

    // AS3: .../_SafeCls_1935.as::addRequest()
    addRequest(request: FriendRequest): void;

    // AS3: .../_SafeCls_1935.as::removeRequest()
    removeRequest(request: FriendRequest): void;

    // AS3: .../_SafeCls_1935.as::acceptRequest()
    acceptRequest(requestId: number): void;

    // AS3: .../_SafeCls_1935.as::acceptAllRequests()
    acceptAllRequests(): void;

    // AS3: .../_SafeCls_1935.as::declineRequest()
    declineRequest(requestId: number): void;

    // AS3: .../_SafeCls_1935.as::declineAllRequests()
    declineAllRequests(): void;
}
