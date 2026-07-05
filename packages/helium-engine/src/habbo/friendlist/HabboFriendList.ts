import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {HabboFriendListEvents, IHabboFriendList} from './IHabboFriendList';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";

// Data classes
import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';

// Events
import {MessengerInitEvent} from '@habbo/communication/messages/incoming/friendlist/MessengerInitEvent';
import {
    FriendListFragmentMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListFragmentMessageEvent';
import {
    FriendListUpdateMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListUpdateMessageEvent';
import {FriendRequestsMessageEvent} from '@habbo/communication/messages/incoming/friendlist/FriendRequestsMessageEvent';
import {
    NewFriendRequestMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/NewFriendRequestMessageEvent';
import {
    AcceptFriendResultMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/AcceptFriendResultMessageEvent';
import {
    FriendNotificationMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendNotificationMessageEvent';
import {
    FindFriendsProcessResultMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FindFriendsProcessResultMessageEvent';
import {
    HabboSearchResultMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/HabboSearchResultMessageEvent';
import {
    FollowFriendFailedMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FollowFriendFailedMessageEvent';
import {
    RoomInviteErrorMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/RoomInviteErrorMessageEvent';
import {MessengerErrorEvent} from '@habbo/communication/messages/incoming/friendlist/MessengerErrorEvent';

// Parsers
import type {MessengerInitParser} from '@habbo/communication/messages/parser/friendlist/MessengerInitParser';
import type {
    FriendListFragmentMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendListFragmentMessageParser';
import type {
    FriendListUpdateMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendListUpdateMessageParser';
import type {
    FriendRequestsMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendRequestsMessageParser';
import type {
    NewFriendRequestMessageParser
} from '@habbo/communication/messages/parser/friendlist/NewFriendRequestMessageParser';
import type {
    AcceptFriendResultMessageParser
} from '@habbo/communication/messages/parser/friendlist/AcceptFriendResultMessageParser';
import type {
    FriendNotificationMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendNotificationMessageParser';
import type {
    FindFriendsProcessResultMessageParser
} from '@habbo/communication/messages/parser/friendlist/FindFriendsProcessResultMessageParser';
import type {
    HabboSearchResultMessageParser
} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultMessageParser';
import type {
    FollowFriendFailedMessageParser
} from '@habbo/communication/messages/parser/friendlist/FollowFriendFailedMessageParser';
import type {
    RoomInviteErrorMessageParser
} from '@habbo/communication/messages/parser/friendlist/RoomInviteErrorMessageParser';
import type {
    MessengerErrorMessageParser
} from '@habbo/communication/messages/parser/friendlist/MessengerErrorMessageParser';

// Composers
import {
    MessengerInitMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/MessengerInitMessageComposer';
import {
    GetFriendRequestsMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/GetFriendRequestsMessageComposer';
import {
    FriendListUpdateMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/FriendListUpdateMessageComposer';
import {
    RequestFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/RequestFriendMessageComposer';
import {
    AcceptFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer';
import {
    DeclineFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/DeclineFriendMessageComposer';
import {
    RemoveFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/RemoveFriendMessageComposer';
import {
    SetRelationshipStatusMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/SetRelationshipStatusMessageComposer';
import {
    FindNewFriendsMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer';
import {HabboSearchMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/HabboSearchMessageComposer';
import type {IMessageComposer} from "@core";

const log = Logger.getLogger('HabboFriendList');

/**
 * HabboFriendList - Core friend list manager component.
 *
 * Manages the friend list, friend requests, search, and related messaging.
 * Extends Component for DI lifecycle and uses a separate EventEmitter
 * (friendListEvents) to avoid conflicting with the Component base class events.
 *
 * @see source_as_win63/habbo/friendlist/HabboFriendList.as
 */
export class HabboFriendList extends Component implements IHabboFriendList
{
    private _communicationManager: IHabboCommunicationManager | null = null;
    private _friends: Map<number, FriendData> = new Map();
    private _friendRequests: FriendRequestData[] = [];
    private _messageEvents: IMessageEvent[] = [];
    private _initialized: boolean = false;
    private _userFriendLimit: number = 0;
    private _extendedFriendLimit: number = 0;
    private _updateTimerId: ReturnType<typeof setInterval> | null = null;

    constructor(context: IContext, flags: number = 0)
    {
        super(context, flags);
    }

    /**
	 * Separate event emitter for friend list events.
	 * Uses a different property name to avoid overriding Component.events.
	 */
    private _friendListEvents: EventEmitter<HabboFriendListEvents> = new EventEmitter<HabboFriendListEvents>();

    get friendListEvents(): EventEmitter<HabboFriendListEvents>
    {
        return this._friendListEvents;
    }

    get hasFriendsListInitialized(): boolean
    {
        return this._initialized;
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
        ];
    }

    getFriendById(id: number): FriendData | null
    {
        return this._friends.get(id) ?? null;
    }

    // === Public API ===

    getFriendByName(name: string): FriendData | null
    {
        for(const friend of this._friends.values())
        {
            if(friend.name === name)
            {
                return friend;
            }
        }
        return null;
    }

    getFriends(): FriendData[]
    {
        return Array.from(this._friends.values());
    }

    getFriendNames(): string[]
    {
        const names: string[] = [];

        for(const friend of this._friends.values())
        {
            names.push(friend.name);
        }

        return names;
    }

    getFriendCount(onlineOnly: boolean): number
    {
        if(!onlineOnly)
        {
            return this._friends.size;
        }

        let count = 0;

        for(const friend of this._friends.values())
        {
            if(friend.online)
            {
                count++;
            }
        }

        return count;
    }

    isFriend(userId: number): boolean
    {
        return this._friends.has(userId);
    }

    canBeAskedForAFriend(userId: number): boolean
    {
        if(!this._initialized)
        {
            return false;
        }

        return !this.isFriend(userId) && this._friends.size < this._userFriendLimit;
    }

    requestFriend(userName: string): void
    {
        this.send(new RequestFriendMessageComposer(userName));
    }

    acceptFriend(...requestIds: number[]): void
    {
        this.send(new AcceptFriendMessageComposer(...requestIds));
    }

    declineFriend(declineAll: boolean, ...requestIds: number[]): void
    {
        this.send(new DeclineFriendMessageComposer(declineAll, ...requestIds));
    }

    removeFriend(...friendIds: number[]): void
    {
        this.send(new RemoveFriendMessageComposer(...friendIds));
    }

    findNewFriends(): void
    {
        this.send(new FindNewFriendsMessageComposer());
    }

    searchUsers(query: string): void
    {
        this.send(new HabboSearchMessageComposer(query));
    }

    setRelationship(friendId: number, status: number): void
    {
        this.send(new SetRelationshipStatusMessageComposer(friendId, status));
    }

    getRelationshipStatus(friendId: number): number
    {
        const friend = this._friends.get(friendId);

        if(friend)
        {
            return friend.relationshipStatus;
        }

        return 0;
    }

    dispose(): void
    {
        if(this._disposed) return;

        if(this._updateTimerId)
        {
            clearInterval(this._updateTimerId);
            this._updateTimerId = null;
        }

        if(this._communicationManager)
        {
            for(const event of this._messageEvents)
            {
                this._communicationManager.removeMessageEvent(event);
            }
        }

        this._messageEvents = [];
        this._friends.clear();
        this._friendRequests = [];
        this._friendListEvents.removeAllListeners();

        super.dispose();
    }

    // === Private helpers ===

    protected initComponent(): void
    {
        log.info('Initializing HabboFriendList...');

        this.addMessageEvent(new MessengerInitEvent(this.onMessengerInit.bind(this)));
        this.addMessageEvent(new FriendListFragmentMessageEvent(this.onFriendListFragment.bind(this)));

        this.send(new MessengerInitMessageComposer());
    }

    private send(composer: IMessageComposer<any>): void
    {
        if(this._communicationManager?.connection)
        {
            this._communicationManager.connection.send(composer);
        }
    }

    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager)
        {
            this._communicationManager.addMessageEvent(event);

            this._messageEvents.push(event);
        }
    }

    private registerListeners(): void
    {
        this.addMessageEvent(new FriendListUpdateMessageEvent(this.onFriendListUpdate.bind(this)));
        this.addMessageEvent(new FriendRequestsMessageEvent(this.onFriendRequests.bind(this)));
        this.addMessageEvent(new NewFriendRequestMessageEvent(this.onNewFriendRequest.bind(this)));
        this.addMessageEvent(new AcceptFriendResultMessageEvent(this.onAcceptFriendResult.bind(this)));
        this.addMessageEvent(new FriendNotificationMessageEvent(this.onFriendNotification.bind(this)));
        this.addMessageEvent(new FindFriendsProcessResultMessageEvent(this.onFindFriendsProcessResult.bind(this)));
        this.addMessageEvent(new HabboSearchResultMessageEvent(this.onHabboSearchResult.bind(this)));
        this.addMessageEvent(new FollowFriendFailedMessageEvent(this.onFollowFriendFailed.bind(this)));
        this.addMessageEvent(new RoomInviteErrorMessageEvent(this.onRoomInviteError.bind(this)));
        this.addMessageEvent(new MessengerErrorEvent(this.onMessengerError.bind(this)));
    }

    // === Message handlers ===

    private sendFriendListUpdate(): void
    {
        log.debug('Sending friend list update request');

        this.send(new FriendListUpdateMessageComposer());
    }

    private onMessengerInit(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as MessengerInitParser;

        if(!parser) return;

        this._userFriendLimit = parser.userFriendLimit;
        this._extendedFriendLimit = parser.extendedFriendLimit;

        log.info(`Messenger initialized. Friend limit: ${this._userFriendLimit}, Extended: ${this._extendedFriendLimit}`);

        // Start periodic update timer (every 120 seconds, matching AS3)
        if(!this._updateTimerId)
        {
            this._updateTimerId = setInterval(() => this.sendFriendListUpdate(), 120000);
        }

        // Request friend requests
        this.send(new GetFriendRequestsMessageComposer());

        // Register remaining listeners after initialization
        this.registerListeners();

        this._friendListEvents.emit('friendListInitialized');
    }

    private onFriendListFragment(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FriendListFragmentMessageParser;

        if(!parser) return;

        for(const friendData of parser.friendFragment)
        {
            this._friends.set(friendData.id, friendData);
        }

        this._friendListEvents.emit('friendListFragment', parser.friendFragment);

        if(parser.fragmentIndex === parser.totalFragments - 1)
        {
            this._initialized = true;
            log.info(`Friend list fully loaded: ${this._friends.size} friends`);
        }
    }

    private onFriendListUpdate(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FriendListUpdateMessageParser;

        if(!parser) return;

        // Remove friends
        for(const removedId of parser.removedFriendIds)
        {
            this._friends.delete(removedId);
        }

        // Add new friends
        for(const addedFriend of parser.addedFriends)
        {
            this._friends.set(addedFriend.id, addedFriend);
        }

        // Update existing friends
        for(const updatedFriend of parser.updatedFriends)
        {
            this._friends.set(updatedFriend.id, updatedFriend);
        }

        this._friendListEvents.emit('friendListUpdate', parser.addedFriends, parser.updatedFriends, parser.removedFriendIds);
    }

    private onFriendRequests(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FriendRequestsMessageParser;

        if(!parser) return;

        this._friendRequests = parser.reqs;

        this._friendListEvents.emit('friendRequestsReceived', parser.reqs);
    }

    private onNewFriendRequest(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as NewFriendRequestMessageParser;

        if(!parser) return;

        if(parser.req)
        {
            this._friendRequests.push(parser.req);

            this._friendListEvents.emit('newFriendRequest', parser.req);
        }
    }

    private onAcceptFriendResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as AcceptFriendResultMessageParser;

        if(!parser) return;

        for(const failure of parser.failures)
        {
            log.warn(`Accept friend failed for sender ${failure.senderId}, error: ${failure.errorCode}`);

            this._friendListEvents.emit('acceptFriendFailed', failure.senderId, failure.errorCode);
        }
    }

    private onFriendNotification(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FriendNotificationMessageParser;

        if(!parser) return;

        this._friendListEvents.emit('friendNotification', parser.avatarId, parser.typeCode, parser.message);
    }

    private onFindFriendsProcessResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FindFriendsProcessResultMessageParser;

        if(!parser) return;

        this._friendListEvents.emit('findFriendsResult', parser.success);
    }

    private onHabboSearchResult(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as HabboSearchResultMessageParser;

        if(!parser) return;

        this._friendListEvents.emit('searchResult', parser.friends, parser.others);
    }

    private onFollowFriendFailed(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as FollowFriendFailedMessageParser;

        if(!parser) return;

        log.warn(`Follow friend failed: errorCode=${parser.errorCode}`);
        this._friendListEvents.emit('followFriendFailed', parser.errorCode);
    }

    private onRoomInviteError(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as RoomInviteErrorMessageParser;

        if(!parser) return;

        log.warn(`Room invite error: errorCode=${parser.errorCode}, failed recipients: ${parser.failedRecipients}`);
        this._friendListEvents.emit('roomInviteError', parser.errorCode, parser.failedRecipients);
    }

    // === Dispose ===

    private onMessengerError(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as MessengerErrorMessageParser;

        if(!parser) return;

        log.warn(`Messenger error: errorCode=${parser.errorCode}, clientMessageId=${parser.clientMessageId}`);

        this._friendListEvents.emit('messengerError', parser.errorCode, parser.clientMessageId);
    }
}
