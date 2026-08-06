import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {IID_SessionDataManager} from '@iid/index';
import {Logger} from '@core/utils/Logger';

import type {IHabboModeration} from './IHabboModeration';
import {IssueManager} from './IssueManager';
import {ModerationMessageHandler} from './ModerationMessageHandler';
import {LocalizationHelper} from './LocalizationHelper';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";

const log = Logger.getLogger('habbo.moderation.ModerationManager');

/**
 * Central moderation component.
 *
 * Manages issue tracking, permissions, connections, sound, and tracking.
 * Creates and owns the IssueManager and ModerationMessageHandler.
 *
 * @see source_as_win63/habbo/moderation/ModerationManager.as
 */
export class ModerationManager extends Component implements IHabboModeration
{
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    constructor(context: IContext)
    {
        super(context);
    }

    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    /**
	 * The session data manager dependency.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    private _messageHandler: ModerationMessageHandler | null = null;

    /**
	 * The message handler for this moderation component.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get messageHandler()
    get messageHandler(): ModerationMessageHandler | null
    {
        return this._messageHandler;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/moderation/ModerationManager.as::_issueManager
    private _issueManager: IssueManager | null = null;

    /**
	 * The issue manager for this moderation component.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get issueManager()
    get issueManager(): IssueManager | null
    {
        return this._issueManager;
    }

    private _initData: unknown | null = null;

    /**
	 * The moderator initialization data received from the server.
	 */
    get initData(): unknown | null
    {
        return this._initData;
    }

    set initData(value: unknown | null)
    {
        this._initData = value;
    }

    private _currentFlatId: number = 0;

    /**
	 * The current flat (room) ID the user is in.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get currentFlatId()
    get currentFlatId(): number
    {
        return this._currentFlatId;
    }

    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::set currentFlatId()
    set currentFlatId(value: number)
    {
        this._currentFlatId = value;
    }

    /**
	 * The communication connection.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get connection()
    get connection(): IConnection | null
    {
        return this._communication?.connection ?? null;
    }

    /**
	 * Whether the current user has moderator privileges.
	 * Checks if the user has security level 5 or higher.
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::get isModerator()
    get isModerator(): boolean
    {
        return this._sessionDataManager?.hasSecurity(5) ?? false;
    }

    /**
	 * Component dependencies: HabboCommunicationManager and SessionDataManager.
	 */
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;

                    if(manager)
                    {
                        LocalizationHelper.setLocalizationManager(null);
                    }
                },
                true
            ),
        ];
    }

    /**
	 * Called when a user is selected in the UI for moderation.
	 *
	 * @param userId - The ID of the selected user
	 * @param userName - The name of the selected user
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::userSelected()
    userSelected(userId: number, userName: string): void
    {
        log.debug('User selected:', userId, userName);
    }

    /**
	 * Navigate to a room by ID.
	 *
	 * @param roomId - The room ID to navigate to
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::goToRoom()
    goToRoom(roomId: number): void
    {
        this.context.createLinkEvent('navigator/goto/' + roomId);
    }

    /**
	 * Open a forum thread by group and thread ID.
	 *
	 * @param groupId - The group ID
	 * @param threadId - The thread ID
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::openThread()
    openThread(groupId: number, threadId: number): void
    {
        this.context.createLinkEvent('groupforum/' + groupId + '/' + threadId);
    }

    /**
	 * Open a specific message in a forum thread.
	 *
	 * @param groupId - The group ID
	 * @param threadId - The thread ID
	 * @param messageId - The message ID
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::openThreadMessage()
    openThreadMessage(groupId: number, threadId: number, messageId: number): void
    {
        this.context.createLinkEvent('groupforum/' + groupId + '/' + threadId + '/' + messageId);
    }

    /**
	 * Log a moderation event for tracking.
	 *
	 * @param action - The action performed
	 * @param label - A label for the event
	 */
    // AS3: .../src/com/sulake/habbo/moderation/ModerationManager.as::logEvent()
    logEvent(action: string, label: string): void
    {
        log.debug('Moderation event:', action, label);
    }

    /**
	 * Dispose of the moderation manager and all owned resources.
	 */
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._messageHandler !== null)
        {
            this._messageHandler.dispose();
            this._messageHandler = null;
        }

        if(this._issueManager !== null)
        {
            this._issueManager.dispose();
            this._issueManager = null;
        }

        this._initData = null;

        log.debug('ModerationManager disposed');
        super.dispose();
    }

    /**
	 * Initialize the component after all dependencies are resolved.
	 * Creates the IssueManager and ModerationMessageHandler.
	 */
    protected override initComponent(): void
    {
        this._issueManager = new IssueManager(this);
        this._messageHandler = new ModerationMessageHandler(this);

        log.debug('ModerationManager initialized');
    }
}
