import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import {ModeratorInitMessageEvent} from '@habbo/communication/messages/incoming/moderation/ModeratorInitMessageEvent';
import {IssueInfoMessageEvent} from '@habbo/communication/messages/incoming/moderation/IssueInfoMessageEvent';
import {IssueDeletedMessageEvent} from '@habbo/communication/messages/incoming/moderation/IssueDeletedMessageEvent';
import {
    IssuePickFailedMessageEvent
} from '@habbo/communication/messages/incoming/moderation/IssuePickFailedMessageEvent';
import {
    ModeratorUserInfoMessageEvent
} from '@habbo/communication/messages/incoming/moderation/ModeratorUserInfoMessageEvent';
import {
    ModeratorRoomInfoMessageEvent
} from '@habbo/communication/messages/incoming/moderation/ModeratorRoomInfoMessageEvent';
import {
    ModeratorActionResultMessageEvent
} from '@habbo/communication/messages/incoming/moderation/ModeratorActionResultMessageEvent';
import {
    ModeratorToolPreferencesMessageEvent
} from '@habbo/communication/messages/incoming/moderation/ModeratorToolPreferencesMessageEvent';
import {CfhChatlogMessageEvent} from '@habbo/communication/messages/incoming/moderation/CfhChatlogMessageEvent';
import {RoomChatlogMessageEvent} from '@habbo/communication/messages/incoming/moderation/RoomChatlogMessageEvent';
import {UserChatlogMessageEvent} from '@habbo/communication/messages/incoming/moderation/UserChatlogMessageEvent';
import {RoomVisitsMessageEvent} from '@habbo/communication/messages/incoming/moderation/RoomVisitsMessageEvent';
import {
    UserClassificationMessageEvent
} from '@habbo/communication/messages/incoming/moderation/UserClassificationMessageEvent';
import {CfhTopicsInitMessageEvent} from '@habbo/communication/messages/incoming/help/CfhTopicsInitMessageEvent';
import type {CfhTopicsInitMessageParser} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import {
    CfhSanctionMessageEvent
} from '@habbo/communication/messages/incoming/moderation/CfhSanctionMessageEvent';
import type {
    CfhSanctionMessageParser
} from '@habbo/communication/messages/parser/moderation/CfhSanctionMessageParser';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {
    CloseConnectionMessageEvent
} from '@habbo/communication/messages/incoming/room/session/CloseConnectionMessageEvent';

import type {
    ModeratorInitMessageParser
} from '@habbo/communication/messages/parser/moderation/ModeratorInitMessageParser';
import type {IssueInfoMessageParser} from '@habbo/communication/messages/parser/moderation/IssueInfoMessageParser';
import type {
    IssueDeletedMessageParser
} from '@habbo/communication/messages/parser/moderation/IssueDeletedMessageParser';
import type {
    IssuePickFailedMessageParser
} from '@habbo/communication/messages/parser/moderation/IssuePickFailedMessageParser';
import type {ModeratorUserInfoParser} from '@habbo/communication/messages/parser/moderation/ModeratorUserInfoParser';
import type {ModeratorRoomInfoParser} from '@habbo/communication/messages/parser/moderation/ModeratorRoomInfoParser';
import type {
    ModeratorActionResultMessageParser
} from '@habbo/communication/messages/parser/moderation/ModeratorActionResultMessageParser';
import type {
    ModeratorToolPreferencesParser
} from '@habbo/communication/messages/parser/moderation/ModeratorToolPreferencesParser';
import type {CfhChatlogMessageParser} from '@habbo/communication/messages/parser/moderation/CfhChatlogMessageParser';
import type {RoomChatlogMessageParser} from '@habbo/communication/messages/parser/moderation/RoomChatlogMessageParser';
import type {UserChatlogMessageParser} from '@habbo/communication/messages/parser/moderation/UserChatlogMessageParser';
import type {RoomVisitsMessageParser} from '@habbo/communication/messages/parser/moderation/RoomVisitsMessageParser';
import type {
    UserClassificationMessageParser
} from '@habbo/communication/messages/parser/moderation/UserClassificationMessageParser';
import type {
    RoomEntryInfoMessageParser
} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import {
    GetModeratorUserInfoMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetModeratorUserInfoMessageComposer';

import type {ModerationManager} from './ModerationManager';
import type {
    ChatRecordData
} from '@habbo/communication/messages/parser/moderation/ChatRecordData';
import type {IChatlogReceiver} from './IChatlogReceiver';
import type {IUserInfoReceiver} from './IUserInfoReceiver';
import type {RoomToolCtrl} from './RoomToolCtrl';
import type {RoomVisitsCtrl} from './RoomVisitsCtrl';
import {UserClassificationCtrl} from './UserClassificationCtrl';
import {UserClassificationData} from '@habbo/userclassification/UserClassificationData';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.ModerationMessageHandler');

/**
 * Handles all incoming moderation server messages and routes them
 * to the appropriate manager/issueManager methods.
 *
 * Registers event handlers for issues, chatlogs, room info,
 * user info, sanctions, tool preferences, and room enter/exit.
 *
 * @see source_as_win63/habbo/moderation/ModerationMessageHandler.as
 */
export class ModerationMessageHandler
{
    /**
     * Six listener lists, exactly as AS3 holds them. Four are typed on a concrete controller
     * because AS3 types them that way; only the chatlog and user-info lists go through an interface.
     */
    // AS3: ModerationMessageHandler.as::_userInfoListeners
    private _userInfoListeners: IUserInfoReceiver[] = [];

    // AS3: ModerationMessageHandler.as::_roomVisitsListeners
    private _roomVisitsListeners: RoomVisitsCtrl[] = [];

    /** Derived name — `_SafeStr_8278`: the user-classification listeners. */
    // AS3: ModerationMessageHandler.as::_SafeStr_8278
    private _userClassificationListeners: UserClassificationCtrl[] = [];

    // AS3: ModerationMessageHandler.as::_chatlogListeners
    private _chatlogListeners: IChatlogReceiver[] = [];

    // AS3: ModerationMessageHandler.as::_roomInfoListeners
    private _roomInfoListeners: RoomToolCtrl[] = [];

    // AS3: ModerationMessageHandler.as::_roomEnterListeners
    private _roomEnterListeners: RoomToolCtrl[] = [];

    private _manager: ModerationManager;
    private _messageEvents: IMessageEvent[] = [];

    constructor(manager: ModerationManager)
    {
        this._manager = manager;

        this.registerMessageEvents();
    }

    /**
	 * Dispose of the message handler and remove all registered events.
	 */
    dispose(): void
    {
        const connection = this._manager.connection;

        if(connection)
        {
            for(const event of this._messageEvents)
            {
                connection.removeMessageEvent(event);
            }
        }

        this._messageEvents = [];
    }

    /**
	 * Register all moderation message event handlers.
	 */
    private registerMessageEvents(): void
    {
        const connection = this._manager.connection;

        if(!connection)
        {
            log.warn('No connection available for ModerationMessageHandler');
            return;
        }

        this.addMessageEvent(new ModeratorInitMessageEvent(this.onModeratorInit.bind(this)));
        this.addMessageEvent(new IssueInfoMessageEvent(this.onIssueInfo.bind(this)));
        this.addMessageEvent(new IssueDeletedMessageEvent(this.onIssueDeleted.bind(this)));
        this.addMessageEvent(new IssuePickFailedMessageEvent(this.onIssuePickFailed.bind(this)));
        this.addMessageEvent(new ModeratorUserInfoMessageEvent(this.onUserInfo.bind(this)));
        this.addMessageEvent(new ModeratorRoomInfoMessageEvent(this.onRoomInfo.bind(this)));
        this.addMessageEvent(new ModeratorActionResultMessageEvent(this.onModeratorActionResult.bind(this)));
        this.addMessageEvent(new ModeratorToolPreferencesMessageEvent(this.onModeratorToolPreferences.bind(this)));
        this.addMessageEvent(new CfhChatlogMessageEvent(this.onCfhChatlog.bind(this)));
        this.addMessageEvent(new RoomChatlogMessageEvent(this.onRoomChatlog.bind(this)));
        this.addMessageEvent(new UserChatlogMessageEvent(this.onUserChatlog.bind(this)));
        this.addMessageEvent(new RoomVisitsMessageEvent(this.onRoomVisits.bind(this)));
        this.addMessageEvent(new UserClassificationMessageEvent(this.onUserClassification.bind(this)));
        this.addMessageEvent(new CfhTopicsInitMessageEvent(this.onCfhTopics.bind(this)));
        this.addMessageEvent(new CfhSanctionMessageEvent(this.onSanctions.bind(this)));
        this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));
        this.addMessageEvent(new CloseConnectionMessageEvent(this.onRoomExit.bind(this)));
    }

    /**
	 * Add a message event to the connection and track it for cleanup.
	 */
    private addMessageEvent(event: IMessageEvent): void
    {
        const connection = this._manager.connection;

        if(connection)
        {
            connection.addMessageEvent(event);
            this._messageEvents.push(event);
        }
    }

    /**
	 * Handle moderator initialization message.
	 * Processes initial issue list and message templates.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onModeratorInit()
    private onModeratorInit(event: IMessageEvent): void
    {
        if(!event || !this._manager)
        {
            return;
        }

        const parser = event.parser as ModeratorInitMessageParser;

        if(!parser || !parser.data)
        {
            return;
        }

        const data = parser.data;
        const issues = data.issues;

        for(const issue of issues)
        {
            this._manager.issueManager?.updateIssue(issue);
        }

        this._manager.issueManager?.updateIssueBrowser();
        this._manager.initMsg = data;

        // The init packet is what puts the mod tool on screen — AS3 shows the start panel here and
        // nowhere else, so without this line the whole tool stays invisible for a moderator.
        this._manager.startPanel?.show();

        log.debug('Moderator initialized with', issues.length, 'issues');
    }

    /**
	 * Handle single issue info update.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onIssueInfo()
    private onIssueInfo(event: IMessageEvent): void
    {
        if(!event || !this._manager)
        {
            return;
        }

        const parser = event.parser as IssueInfoMessageParser;

        if(!parser)
        {
            return;
        }

        const issueData = parser.issueData;

        if(!issueData)
        {
            return;
        }

        this._manager.issueManager?.playSound(issueData);
        this._manager.issueManager?.updateIssue(issueData);
    }

    /**
	 * Handle issue deleted message.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onIssueDeleted()
    private onIssueDeleted(event: IMessageEvent): void
    {
        if(!event || !this._manager)
        {
            return;
        }

        const parser = event.parser as IssueDeletedMessageParser;

        if(!parser)
        {
            return;
        }

        this._manager.issueManager?.removeIssue(parser.issueId);
    }

    /**
	 * Handle issue pick failure.
	 * Retries auto-pick if enabled and within retry limits.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onIssuePickFailed()
    private onIssuePickFailed(event: IMessageEvent): void
    {
        const parser = event.parser as IssuePickFailedMessageParser;

        if(!parser)
        {
            return;
        }

        let showAlert = true;
        const issues = parser.issues;
        const retryEnabled = parser.retryEnabled;
        const retryCount = parser.retryCount;

        const pickedAlready = this._manager.issueManager?.issuePickFailed(issues) ?? false;

        if(pickedAlready)
        {
            if(retryEnabled)
            {
                if(retryCount < 10)
                {
                    showAlert = false;
                    this._manager.issueManager?.autoPick('pick failed retry', retryEnabled, retryCount);
                }
            }
        }

        if(showAlert)
        {
            log.warn('Issue picking failed');
        }
    }

    /**
	 * Handle moderator user info response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onUserInfo()
    private onUserInfo(event: IMessageEvent): void
    {
        const parser = event.parser as ModeratorUserInfoParser;

        if(!parser || !parser.data)
        {
            return;
        }

        for(const listener of this._userInfoListeners.slice())
        {
            listener.onUserInfo(parser.data);
        }
    }

    /**
	 * Handle moderator room info response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onRoomInfo()
    private onRoomInfo(event: IMessageEvent): void
    {
        const parser = event.parser as ModeratorRoomInfoParser;

        if(!parser || !parser.data)
        {
            return;
        }

        for(const listener of this._roomInfoListeners.slice())
        {
            listener.onRoomInfo(parser.data);
        }
    }

    /**
	 * Handle moderator action result.
	 * Requests updated user info on success.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onModeratorActionResult()
    private onModeratorActionResult(event: IMessageEvent): void
    {
        const parser = event.parser as ModeratorActionResultMessageParser;

        if(!parser)
        {
            return;
        }

        log.debug('Got mod action result:', parser.userId, parser.success);

        if(parser.success)
        {
            this._manager.connection?.send(new GetModeratorUserInfoMessageComposer(parser.userId));
        }
        else
        {
            log.warn('Moderation action failed for user:', parser.userId);
        }
    }

    /**
	 * Handle moderator tool preferences (window position/size).
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onModeratorToolPreferences()
    private onModeratorToolPreferences(event: IMessageEvent): void
    {
        if(!this._manager || !this._manager.issueManager)
        {
            return;
        }

        const parser = event.parser as ModeratorToolPreferencesParser;

        if(!parser)
        {
            return;
        }

        this._manager.issueManager.setToolPreferences(
            parser.windowX,
            parser.windowY,
            parser.windowHeight,
            parser.windowWidth
        );
    }

    /**
	 * Handle CFH chatlog response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onCfhChatlog()
    private onCfhChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as CfhChatlogMessageParser;

        if(!parser || !parser.data)
        {
            return;
        }

        // The two participants are tagged 0 (caller) and 1 (reported); ChatlogCtrl tints their
        // rows differently. Only ever these two values, which is why the map is boolean here.
        const highlighted = new Map<number, boolean>();

        highlighted.set(parser.data.callerUserId, false);
        highlighted.set(parser.data.reportedUserId, true);

        this.onChatlog(
            `Call For Help Evidence #${parser.data.chatRecordId}`,
            WindowTracker.TYPE_CHATLOG_ISSUE,
            parser.data.callId,
            [parser.data.chatRecord],
            highlighted
        );
    }

    /**
	 * Handle room chatlog response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onRoomChatlog()
    private onRoomChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as RoomChatlogMessageParser;

        if(!parser || !parser.data)
        {
            return;
        }

        this.onChatlog(
            `Room Chatlog: ${parser.data.roomName}`,
            WindowTracker.TYPE_CHATLOG_ROOM,
            parser.data.roomId,
            [parser.data],
            new Map<number, boolean>()
        );
    }

    /**
	 * Handle user chatlog response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onUserChatlog()
    private onUserChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as UserChatlogMessageParser;

        if(!parser)
        {
            return;
        }

        const highlighted = new Map<number, boolean>();

        highlighted.set(parser.userId, false);

        this.onChatlog(
            `User Chatlog: ${parser.userName}`,
            WindowTracker.TYPE_CHATLOG_USER,
            parser.userId,
            parser.rooms,
            highlighted
        );
    }

    /**
     * All three chatlog flavours come back through one listener list, so each receiver filters on
     * the type and id it asked for. The list is copied first: a receiver unsubscribes itself the
     * moment its answer arrives.
     */
    // AS3: ModerationMessageHandler.as::onChatlog()
    private onChatlog(
        caption: string,
        type: number,
        id: number,
        records: ChatRecordData[],
        highlightedUserIds: Map<number, boolean>
    ): void
    {
        for(const listener of this._chatlogListeners.slice())
        {
            listener.onChatlog(caption, type, id, records, highlightedUserIds);
        }
    }

    /**
	 * Handle room visits response.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onRoomVisits()
    private onRoomVisits(event: IMessageEvent): void
    {
        const parser = event.parser as RoomVisitsMessageParser;

        if(!parser)
        {
            return;
        }

        for(const listener of this._roomVisitsListeners.slice())
        {
            listener.onRoomVisits(parser);
        }
    }

    /**
	 * Handle user classification response.
	 */
    /**
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onCfhTopics()
     *
     * The same message the help module subscribes — AS3 registers it from both places, and both
     * need it: help builds the report dialog's category list from it, moderation stores it on the
     * issue manager so a picked issue can name its topic.
     */
    private onCfhTopics(event: IMessageEvent): void
    {
        const parser = event.parser as CfhTopicsInitMessageParser | null;

        if(parser === null) return;

        this._manager.cfhTopics = parser.callForHelpCategories;
    }

    // AS3: .../moderation/ModerationMessageHandler.as::onSanctions()
    private onSanctions(event: IMessageEvent): void
    {
        const parser = event.parser as CfhSanctionMessageParser | null;

        if(parser === null) return;

        log.debug(`Got sanction data...${[parser.issueId, parser.accountId, parser.sanctionType?.name]}`);
        this._manager.issueManager?.updateSanctionData(parser.issueId, parser.accountId, parser.sanctionType);
    }

    private onUserClassification(event: IMessageEvent): void
    {
        const parser = event.parser as UserClassificationMessageParser;

        if(!parser)
        {
            return;
        }

        const classifications: UserClassificationData[] = [];

        for(const [userId, userName] of parser.classifiedUsernameMap)
        {
            classifications.push(
                new UserClassificationData(userId, userName, parser.classifiedUserTypeMap.get(userId) ?? '')
            );
        }

        // AS3 builds and shows a fresh window here *and then* dispatches to the listener list — the
        // window it just built is the one that receives the data, because `show()` subscribes.
        const view = new UserClassificationCtrl(
            this._manager, ModerationMessageHandler.ROOM_USER_CLASSIFICATION_TYPE
        );

        view.show();

        for(const listener of this._userClassificationListeners.slice())
        {
            listener.onUserClassification(
                ModerationMessageHandler.ROOM_USER_CLASSIFICATION_TYPE, classifications
            );
        }
    }

    /**
	 * Handle room entry - update current flat ID.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onRoomEnter()
    private onRoomEnter(event: IMessageEvent): void
    {
        const parser = event.parser as RoomEntryInfoMessageParser;

        if(!parser)
        {
            return;
        }

        this._manager.currentFlatId = parser.guestRoomId;
        this._manager.startPanel?.guestRoomEntered(parser);

        for(const listener of this._roomEnterListeners.slice())
        {
            listener.onRoomChange();
        }
    }

    /**
	 * Handle room exit - reset current flat ID.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationMessageHandler.as::onRoomExit()
    private onRoomExit(_event: IMessageEvent): void
    {
        this._manager.currentFlatId = 0;
        this._manager.startPanel?.roomExited();

        for(const listener of this._roomEnterListeners.slice())
        {
            listener.onRoomChange();
        }
    }

    /** AS3 passes the literal `1` for a room-wide classification lookup. */
    // AS3: ModerationMessageHandler.as::onRoomUserClassification()
    private static readonly ROOM_USER_CLASSIFICATION_TYPE: number = 1;

    // AS3: ModerationMessageHandler.as::addUserInfoListener()
    public addUserInfoListener(listener: IUserInfoReceiver): void
    {
        this._userInfoListeners.push(listener);
    }

    // AS3: ModerationMessageHandler.as::removeUserInfoListener()
    public removeUserInfoListener(listener: IUserInfoReceiver): void
    {
        this._userInfoListeners = this._userInfoListeners.filter((entry) => entry !== listener);
    }

    // AS3: ModerationMessageHandler.as::addRoomInfoListener()
    public addRoomInfoListener(listener: RoomToolCtrl): void
    {
        this._roomInfoListeners.push(listener);
    }

    // AS3: ModerationMessageHandler.as::removeRoomInfoListener()
    public removeRoomInfoListener(listener: RoomToolCtrl): void
    {
        this._roomInfoListeners = this._roomInfoListeners.filter((entry) => entry !== listener);
    }

    // AS3: ModerationMessageHandler.as::addRoomEnterListener()
    public addRoomEnterListener(listener: RoomToolCtrl): void
    {
        this._roomEnterListeners.push(listener);
    }

    // AS3: ModerationMessageHandler.as::removeRoomEnterListener()
    public removeRoomEnterListener(listener: RoomToolCtrl): void
    {
        this._roomEnterListeners = this._roomEnterListeners.filter((entry) => entry !== listener);
    }

    // AS3: ModerationMessageHandler.as::addRoomVisitsListener()
    public addRoomVisitsListener(listener: RoomVisitsCtrl): void
    {
        this._roomVisitsListeners.push(listener);
    }

    // AS3: ModerationMessageHandler.as::removeRoomVisitsListener()
    public removeRoomVisitsListener(listener: RoomVisitsCtrl): void
    {
        this._roomVisitsListeners = this._roomVisitsListeners.filter((entry) => entry !== listener);
    }

    // AS3: ModerationMessageHandler.as::addChatlogListener()
    public addChatlogListener(listener: IChatlogReceiver): void
    {
        this._chatlogListeners.push(listener);
    }

    // AS3: ModerationMessageHandler.as::removeChatlogListener()
    public removeChatlogListener(listener: IChatlogReceiver): void
    {
        this._chatlogListeners = this._chatlogListeners.filter((entry) => entry !== listener);
    }

    // AS3: ModerationMessageHandler.as::addUserClassificationListener()
    public addUserClassificationListener(listener: UserClassificationCtrl): void
    {
        this._userClassificationListeners.push(listener);
    }

    /**
     * **AS3 assigns the filtered list to the wrong field here.** It filters
     * `_SafeStr_8278` (the classification listeners) and then writes the result to
     * `_roomVisitsListeners` — a copy-paste slip. Ported faithfully that would leave the classification
     * listener subscribed forever *and* replace the room-visits list with classification controllers,
     * so the next room-visits answer would call `onRoomVisits()` on an object that has no such method.
     * In AS3 that is a silent runtime error; here it would throw. The assignment is corrected to the
     * list the filter reads, which is the only reading that is neither a crash nor a silent deletion
     * of AS3 behaviour — the same call this port already made for `DailyTasksController`.
     */
    // AS3: ModerationMessageHandler.as::removeUserClassificationListener()
    public removeUserClassificationListener(listener: UserClassificationCtrl): void
    {
        this._userClassificationListeners =
            this._userClassificationListeners.filter((entry) => entry !== listener);
    }
}
