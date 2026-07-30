import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';
import type {HabboSearchResultData} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultData';
import type {EventEmitter} from 'eventemitter3';
import type {IFriend} from './IFriend';

/**
 * Events emitted by the friend list manager.
 *
 * Port-specific: AS3 has no equivalent bus — its consumers read the friend list
 * directly — but several ported systems were built against this, so the manager keeps
 * feeding it alongside the AS3 paths.
 */
export interface IHabboFriendListEvents
{
    'friendListInitialized': () => void;
    'friendListFragment': (friends: FriendData[]) => void;
    'friendListUpdate': (addedFriends: FriendData[], updatedFriends: FriendData[], removedFriendIds: number[]) => void;
    'friendRequestsReceived': (requests: FriendRequestData[]) => void;
    'newFriendRequest': (request: FriendRequestData) => void;
    'acceptFriendFailed': (senderId: number, errorCode: number) => void;
    'friendNotification': (avatarId: string, typeCode: number, message: string) => void;
    'searchResult': (friends: HabboSearchResultData[], others: HabboSearchResultData[]) => void;
    'findFriendsResult': (success: boolean) => void;
    'followFriendFailed': (errorCode: number) => void;
    'roomInviteError': (errorCode: number, failedRecipients: number[]) => void;
    'messengerError': (errorCode: number, clientMessageId: number) => void;
}

/**
 * IHabboFriendList
 *
 * The friend list as the rest of the client sees it.
 *
 * The primary tree obfuscates the AS3 interface to `_SafeCls_66`; the name is
 * recovered from `PRODUCTION-201601012205-226667486/.../friendlist/IHabboFriendsList.as`
 * (spelt "Friend" here, matching this port's file and the WIN63 class name).
 *
 * Members marked TS-only have no AS3 counterpart: they are flat accessors this port's
 * consumers were written against, now backed by `FriendCategories`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_66.as
 */
export interface IHabboFriendList
{
    /**
	 * The component's own event bus, where `FriendRequestEvent` is emitted. AS3 reaches
	 * it the same way — `_SafeCls_66` extends `IUnknown`, so every consumer of the
	 * interface already sees `events` (`HabboFriendBarData` subscribes to
	 * `FRE_ACCEPTED`/`FRE_DECLINED` through exactly this).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/runtime/_SafeCls_50.as::get events()
    readonly events: EventEmitter;

    // AS3: .../HabboFriendList.as::get hasfriendsListInitialized()
    readonly hasFriendsListInitialized: boolean;

    // AS3: .../HabboFriendList.as::getFriend()
    getFriendById(id: number): IFriend | null;

    /** TS-only. */
    getFriendByName(name: string): IFriend | null;

    /** TS-only. */
    getFriends(): IFriend[];

    // AS3: .../HabboFriendList.as::getFriendNames()
    getFriendNames(): string[];

    // AS3: .../HabboFriendList.as::getFriendCount()
    getFriendCount(onlineOnly: boolean, followableOnly?: boolean): number;

    /** TS-only. */
    isFriend(userId: number): boolean;

    // AS3: .../HabboFriendList.as::canBeAskedForAFriend()
    canBeAskedForAFriend(userId: number): boolean;

    // AS3: .../HabboFriendList.as::askForAFriend()
    askForAFriend(userId: number, userName: string): boolean;

    /** TS-only wrapper over RequestFriendMessageComposer. */
    requestFriend(userName: string): void;

    /** TS-only wrapper over AcceptFriendMessageComposer. */
    acceptFriend(...requestIds: number[]): void;

    /** TS-only wrapper over DeclineFriendMessageComposer. */
    declineFriend(declineAll: boolean, ...requestIds: number[]): void;

    /** TS-only wrapper over RemoveFriendMessageComposer. */
    removeFriend(...friendIds: number[]): void;

    /** TS-only wrapper over FindNewFriendsMessageComposer. */
    findNewFriends(): void;

    /** TS-only wrapper over HabboSearchMessageComposer. */
    searchUsers(query: string): void;

    // AS3: .../HabboFriendList.as::acceptFriendRequest()
    acceptFriendRequest(requestId: number): void;

    // AS3: .../HabboFriendList.as::acceptAllFriendRequests()
    acceptAllFriendRequests(): void;

    // AS3: .../HabboFriendList.as::declineFriendRequest()
    declineFriendRequest(requestId: number): void;

    // AS3: .../HabboFriendList.as::declineAllFriendRequests()
    declineAllFriendRequests(): void;

    // AS3: .../HabboFriendList.as::setRelationshipStatus()
    setRelationshipStatus(friendId: number, status: number): void;

    /** TS-only alias of setRelationshipStatus(). */
    setRelationship(friendId: number, status: number): void;

    // AS3: .../HabboFriendList.as::getRelationshipStatus()
    getRelationshipStatus(friendId: number): number;

    // AS3: .../HabboFriendList.as::openFriendList()
    openFriendList(): void;

    // AS3: .../HabboFriendList.as::openFriendRequests()
    openFriendRequests(): void;

    // AS3: .../HabboFriendList.as::openFriendSearch()
    openFriendSearch(): void;

    // AS3: .../HabboFriendList.as::close()
    close(): void;

    // AS3: .../HabboFriendList.as::isOpen()
    isOpen(): boolean;

    // AS3: .../HabboFriendList.as::currentTabId()
    currentTabId(): number;

    // AS3: .../HabboFriendList.as::alignBottomLeftTo()
    alignBottomLeftTo(point: {x: number; y: number}): void;

    // AS3: .../HabboFriendList.as::dispose()
    dispose(): void;
}
