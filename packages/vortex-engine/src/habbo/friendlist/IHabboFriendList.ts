import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';
import type {HabboSearchResultData} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultData';
import type {EventEmitter} from 'eventemitter3';
import type {IFriend} from './IFriend';
import type {IWindowContainer} from '@core/window/IWindowContainer';

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
    'searchResult': (friends: HabboSearchResultData[], others: HabboSearchResultData[]) => void;
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
 * The composer-sending members that used to sit here (`requestFriend`, `acceptFriend`,
 * `declineFriend`, `removeFriend`, `findNewFriends`, `searchUsers`) were removed on
 * 2026-08-19: AS3 has the views build and send those composers, this port's views already
 * do, and nothing called the manager-side duplicates. `requestFriend()` was the one
 * exception with a caller, and it bypassed the three guards and the quest ping that
 * `askForAFriend()` carries — that caller now goes through `askForAFriend()`.
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

    /**
	 * Opens a Habbo web page in the `habboMain` window, resolving `linkFormat` against
	 * `parameters` first. Both are implemented on `HabboFriendList` and were simply missing from
	 * this interface.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_66.as::openHabboWebPage()
    openHabboWebPage(linkFormat: string, parameters: Map<string, string>, x: number, y: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_66.as::get mainWindow()
    readonly mainWindow: IWindowContainer | null;

    // AS3: .../HabboFriendList.as::getFriendNames()
    getFriendNames(): string[];

    // AS3: .../HabboFriendList.as::getFriendCount()
    getFriendCount(onlineOnly: boolean, followableOnly?: boolean): number;

    // AS3: .../HabboFriendList.as::canBeAskedForAFriend()
    canBeAskedForAFriend(userId: number): boolean;

    // AS3: .../HabboFriendList.as::askForAFriend()
    askForAFriend(userId: number, userName: string): boolean;

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
