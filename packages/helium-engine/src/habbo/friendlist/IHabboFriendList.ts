import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';
import type {HabboSearchResultData} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultData';

/**
 * Events emitted by the friend list manager
 */
export interface HabboFriendListEvents
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
 * Interface for the Habbo friend list manager.
 *
 * @see source_as_win63/habbo/friendlist/IHabboFriendList.as
 */
export interface IHabboFriendList
{
    // === Friend queries ===
    readonly hasFriendsListInitialized: boolean;

    getFriendById(id: number): FriendData | null;

    getFriendByName(name: string): FriendData | null;

    getFriends(): FriendData[];

    getFriendNames(): string[];

    getFriendCount(onlineOnly: boolean): number;

    isFriend(userId: number): boolean;

    canBeAskedForAFriend(userId: number): boolean;

    // === Friend actions ===
    requestFriend(userName: string): void;

    acceptFriend(...requestIds: number[]): void;

    declineFriend(declineAll: boolean, ...requestIds: number[]): void;

    removeFriend(...friendIds: number[]): void;

    // === Search ===
    findNewFriends(): void;

    searchUsers(query: string): void;

    // === Relationship ===
    setRelationship(friendId: number, status: number): void;

    getRelationshipStatus(friendId: number): number;

    // === Lifecycle ===
    dispose(): void;
}
