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

const log = Logger.getLogger('Moderation');

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
        this._manager.initData = data;

        log.info('Moderator initialized with', issues.length, 'issues');
    }

    /**
	 * Handle single issue info update.
	 */
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
    private onUserInfo(event: IMessageEvent): void
    {
        const parser = event.parser as ModeratorUserInfoParser;

        if(!parser || !parser.data)
        {
            return;
        }

        log.debug('Got user info:', parser.data.userId);
    }

    /**
	 * Handle moderator room info response.
	 */
    private onRoomInfo(event: IMessageEvent): void
    {
        const parser = event.parser as ModeratorRoomInfoParser;

        if(!parser || !parser.data)
        {
            return;
        }

        log.debug('Got room info:', parser.data.flatId);
    }

    /**
	 * Handle moderator action result.
	 * Requests updated user info on success.
	 */
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
    private onCfhChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as CfhChatlogMessageParser;

        if(!parser || !parser.data)
        {
            return;
        }

        log.debug('Got CFH chatlog for record:', parser.data.chatRecordId);
    }

    /**
	 * Handle room chatlog response.
	 */
    private onRoomChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as RoomChatlogMessageParser;

        if(!parser || !parser.data)
        {
            return;
        }

        log.debug('Got room chatlog for room:', parser.data.roomName);
    }

    /**
	 * Handle user chatlog response.
	 */
    private onUserChatlog(event: IMessageEvent): void
    {
        const parser = event.parser as UserChatlogMessageParser;

        if(!parser)
        {
            return;
        }

        log.debug('Got user chatlog for:', parser.userName);
    }

    /**
	 * Handle room visits response.
	 */
    private onRoomVisits(event: IMessageEvent): void
    {
        const parser = event.parser as RoomVisitsMessageParser;

        if(!parser)
        {
            return;
        }

        log.debug('Got room visits for:', parser.userName);
    }

    /**
	 * Handle user classification response.
	 */
    private onUserClassification(event: IMessageEvent): void
    {
        const parser = event.parser as UserClassificationMessageParser;

        if(!parser)
        {
            return;
        }

        log.debug('Got user classification data:', parser.classifiedUsernameMap.size, 'users');
    }

    /**
	 * Handle room entry - update current flat ID.
	 */
    private onRoomEnter(event: IMessageEvent): void
    {
        const parser = event.parser as RoomEntryInfoMessageParser;

        if(!parser)
        {
            return;
        }

        this._manager.currentFlatId = parser.guestRoomId;

        log.debug('Room entered:', parser.guestRoomId);
    }

    /**
	 * Handle room exit - reset current flat ID.
	 */
    private onRoomExit(_event: IMessageEvent): void
    {
        this._manager.currentFlatId = 0;

        log.debug('Room exited');
    }
}
