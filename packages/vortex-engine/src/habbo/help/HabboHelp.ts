import type {IContext} from '@core/runtime';
import {Component, ComponentDependency} from '@core/runtime';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboHelp} from './IHabboHelp';
import {ChatRegistry} from './cfh/registry/chat/ChatRegistry';
import {ChatEventHandler} from './cfh/registry/chat/ChatEventHandler';
import {InstantMessageRegistry} from './cfh/registry/instantmessage/InstantMessageRegistry';
import {InstantMessageEventHandler} from './cfh/registry/instantmessage/InstantMessageEventHandler';
import {UserRegistry} from './cfh/registry/user/UserRegistry';
import {CallForHelpManager} from './CallForHelpManager';
import {GuideHelpManager} from './GuideHelpManager';
import {NameChangeController} from './NameChangeController';
import {SanctionInfo} from './SanctionInfo';
import {HelpMessageHandler} from './HelpMessageHandler';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboFriendList} from '@iid/IIDHabboFriendList';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IMessageComposer} from '@core';

const log = Logger.getLogger('HabboHelp');

/**
 * Main help component
 *
 * Orchestrates all help subsystems including Call For Help (CFH),
 * guide sessions, name changes, sanctions, and report registries.
 * Handles toolbar events, link events, and server message routing.
 *
 * @see source_as_win63/habbo/help/HabboHelp.as
 */
export class HabboHelp extends Component implements IHabboHelp, ILinkEventTracker
{
    public static readonly REPORT_TYPE_EMERGENCY: number = 1;
    public static readonly REPORT_TYPE_GUIDE: number = 2;
    public static readonly REPORT_TYPE_IM: number = 3;
    public static readonly REPORT_TYPE_ROOM: number = 4;
    public static readonly REPORT_TYPE_BULLY: number = 6;
    public static readonly REPORT_TYPE_THREAD: number = 7;
    public static readonly REPORT_TYPE_MESSAGE: number = 8;
    public static readonly REPORT_TYPE_PHOTO: number = 9;

    private _communication: IHabboCommunicationManager | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _localizationManager: IHabboLocalizationManager | null = null;
    private _roomSessionManager: IRoomSessionManager | null = null;
    private _navigator: IHabboNavigator | null = null;
    private _tracking: IHabboTracking | null = null;
    private _friendList: IHabboFriendList | null = null;
    private _imRegistry: InstantMessageRegistry;
    private _chatEventHandler: ChatEventHandler | null = null;
    private _imEventHandler: InstantMessageEventHandler | null = null;
    private _cfhManager: CallForHelpManager | null = null;
    private _guideManager: GuideHelpManager | null = null;
    private _nameChangeController: NameChangeController | null = null;
    private _sanctionInfo: SanctionInfo | null = null;
    private _messageHandler: HelpMessageHandler | null = null;
    private _currentRoomId: number = 0;

    constructor(context: IContext)
    {
        super(context);

        this._userRegistry = new UserRegistry();
        this._chatRegistry = new ChatRegistry();
        this._imRegistry = new InstantMessageRegistry();
    }

    private _chatRegistry: ChatRegistry;

    /**
	 * The chat registry for CFH reports
	 */
    get chatRegistry(): ChatRegistry
    {
        return this._chatRegistry;
    }

    private _userRegistry: UserRegistry;

    // --- Getters ---

    /**
	 * The user registry for CFH reports
	 */
    get userRegistry(): UserRegistry
    {
        return this._userRegistry;
    }

    private _outsideRoom: boolean = false;

    /**
	 * Whether the user is outside a room
	 */
    get outsideRoom(): boolean
    {
        return this._outsideRoom;
    }

    set outsideRoom(value: boolean)
    {
        this._outsideRoom = value;
    }

    /**
	 * The instant message registry for CFH reports
	 */
    get instantMessageRegistry(): InstantMessageRegistry
    {
        return this._imRegistry;
    }

    /**
	 * The Call For Help manager
	 */
    get callForHelpManager(): CallForHelpManager | null
    {
        return this._cfhManager;
    }

    /**
	 * The guide help manager
	 */
    get guideHelpManager(): GuideHelpManager | null
    {
        return this._guideManager;
    }

    /**
	 * The communication manager
	 */
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get toolbar()
    get toolbar(): IHabboToolbar | null
    {
        return this._toolbar;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get roomSessionManager()
    get roomSessionManager(): IRoomSessionManager | null
    {
        return this._roomSessionManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get navigator()
    get navigator(): IHabboNavigator | null
    {
        return this._navigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get tracking()
    get tracking(): IHabboTracking | null
    {
        return this._tracking;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get friendList()
    get friendList(): IHabboFriendList | null
    {
        return this._friendList;
    }

    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as
    // ~16 further public members confirmed absent (soundManager/freeFlowChat getters - neither
    // has a DI dependency wired here yet, unlike the getters above; newUserTourEnabled/newIdentity/
    // citizenshipEnabled/safetyQuizDisabled/guardiansEnabled/callForHelpCategories/reportedUserId/
    // reportedUserName/reportedUserRoomId/reportedUserExtraDataId/reportedUserRoomObjectId;
    // startEmergencyRequest()/closeHabboWay()/closeSafetyBooklet()/showHabboWayQuiz()/
    // showSafetyQuiz()/getXmlWindow()/getModalXmlWindow()/trackGoogle()/setReportMessage()/
    // queryForPendingCallsForHelp()/queryForGuideReportingStatus()/ignoreAndUnfriendReportedUser()/
    // toggleNewHelpWindow()/requestSanctionInfo()/requestReportsStatus()/openCfhFaq()). Confirmed
    // zero current runtime impact: no ported help/** subview requests any of them (0 grep hits) -
    // a wall for a future view, not a live bug. Left as one documented gap rather than 16
    // speculative stubs for views that don't exist yet.

    /**
	 * The own user name (from name change controller)
	 */
    get ownUserName(): string
    {
        return this._nameChangeController?.ownUserName ?? '';
    }

    /**
	 * The own user ID (from name change controller)
	 */
    get ownUserId(): number
    {
        return this._nameChangeController?.ownUserId ?? 0;
    }

    /**
	 * ILinkEventTracker - link pattern prefix
	 */
    get linkPattern(): string
    {
        return 'help/';
    }

    // --- Dependencies ---

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar = toolbar;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    this._roomSessionManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboNavigator,
                (navigator: IHabboNavigator | null) =>
                {
                    this._navigator = navigator;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._tracking = tracking;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboFriendList,
                (friendList: IHabboFriendList | null) =>
                {
                    this._friendList = friendList;
                },
                false
            ),
        ];
    }

    // --- Initialization ---

    /**
	 * Report a bully
	 *
	 * @param userId The user ID to report
	 */
    reportBully(userId: number): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportBully(userId, this._currentRoomId);
            log.debug('Report bully - userId:', userId);
        }
    }

    // --- IHabboHelp methods ---

    /**
	 * Report a user
	 *
	 * @param userId The user ID to report
	 * @param roomId The room ID where the incident occurred
	 * @param userName The user name
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::startPhotoReportingInNewCfhFlow()
    // TODO(AS3): AS3 also calls windowManager.openReportingContentReasonCategory(9) to open the CFH
    // UI for the new flow - that UI router isn't ported (same simplification as reportUser()/
    // reportRoom() etc. below, which all substitute a log.debug for it).
    startPhotoReportingInNewCfhFlow(userId: number, userName: string, extraDataId: string, roomObjectId: number): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportedRoomId = this._currentRoomId;
            this._cfhManager.reportedUserId = userId;
            this._cfhManager.reportedUserName = userName;
            this._cfhManager.reportedRoomObjectId = roomObjectId;
            this._cfhManager.reportedExtraDataId = extraDataId;
            log.debug('Start photo reporting - userId:', userId);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::reportUserName()
    reportUserName(userId: number, userName: string): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportedUserId = userId;
            this._cfhManager.reportedUserName = userName;
            this._cfhManager.reportedRoomId = -1;
            log.debug('Report user name - userId:', userId);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::reportUserFromIM()
    reportUserFromIM(userId: number): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportedUserId = userId;
            log.debug('Report user from IM - userId:', userId);
        }
    }

    reportUser(userId: number, roomId: number, _userName: string): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportedUserId = userId;
            log.debug('Report user - userId:', userId, 'roomId:', roomId);
        }
    }

    /**
	 * Report a room
	 *
	 * @param roomId The room ID
	 * @param roomName The room name
	 * @param roomDescription The room description
	 */
    reportRoom(roomId: number, roomName: string, _roomDescription: string): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportRoom(roomId, roomName);
            log.debug('Report room - roomId:', roomId, 'roomName:', roomName);
        }
    }

    /**
	 * Report a forum thread
	 *
	 * @param groupId The group ID
	 * @param threadId The thread ID
	 */
    reportThread(groupId: number, threadId: number): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportThread(groupId, threadId);
        }
    }

    /**
	 * Report a forum message
	 *
	 * @param groupId The group ID
	 * @param threadId The thread ID
	 * @param messageId The message ID
	 */
    reportMessage(groupId: number, threadId: number, messageId: number): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportMessage(groupId, threadId, messageId);
        }
    }

    /**
	 * Report a selfie
	 *
	 * @param extraDataId The extra data ID
	 * @param description The selfie description
	 * @param userId The reported user ID
	 * @param roomObjectId The room object ID
	 * @param roomId The room ID
	 * @returns Whether the report was submitted
	 */
    reportSelfie(extraDataId: string, description: string, userId: number, roomObjectId: number, roomId: number): boolean
    {
        if(this._cfhManager)
        {
            if(description.length < this.getInteger('help.cfh.length.minimum', 15))
            {
                log.warn('Selfie report message too short');
                return false;
            }

            this._cfhManager.reportSelfie(extraDataId, description, userId, roomObjectId, roomId);
            return true;
        }

        return false;
    }

    /**
	 * Report a photo
	 *
	 * @param extraDataId The extra data ID
	 * @param topicId The topic ID
	 * @param userId The reported user ID
	 * @param roomObjectId The room object ID
	 * @param roomId The room ID
	 * @returns Whether the report was submitted
	 */
    reportPhoto(extraDataId: string, topicId: number, userId: number, roomObjectId: number, roomId: number): boolean
    {
        if(this._cfhManager)
        {
            if(topicId === 0)
            {
                log.warn('Photo report has no topic');
                return false;
            }

            this._cfhManager.reportPhoto(extraDataId, topicId, userId, roomObjectId, roomId);
            return true;
        }

        return false;
    }

    /**
	 * Request a guide
	 */
    requestGuide(): void
    {
        if(this.getBoolean('guides.enabled') && this._guideManager)
        {
            this._guideManager.createHelpRequest(0);
        }
    }

    /**
	 * Start the name change flow
	 */
    startNameChange(): void
    {
        if(this._nameChangeController)
        {
            this._nameChangeController.showView();
        }
    }

    /**
	 * Show the welcome screen
	 *
	 * @param title The title text
	 * @param body The body text
	 * @param position The position (0=left, 1=right)
	 * @param imageName Optional image name
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::showWelcomeScreen()
    // delegates to a WelcomeScreenController with all 4 args; that controller isn't ported yet, so
    // this only logs the title.
    showWelcomeScreen(title: string, _body: string, _position: number, _imageName?: string | null): void
    {
        log.debug('Show welcome screen -', title);
    }

    /**
	 * Show the Habbo Way page
	 */
    showHabboWay(): void
    {
        log.debug('Show Habbo Way');
    }

    /**
	 * Show the safety booklet
	 */
    showSafetyBooklet(): void
    {
        log.debug('Show safety booklet');
    }

    /**
	 * Show the tour popup
	 */
    showTourPopup(): void
    {
        if(this._guideManager)
        {
            this._guideManager.openTourPopup();
        }
    }

    /**
	 * Handle a link event
	 *
	 * Handles links like "help/tour", "help/report/room/{id}/{name}", etc.
	 *
	 * @param link The full link string
	 */
    linkReceived(link: string): void
    {
        if(link === 'help/tour')
        {
            this.requestGuide();
        }

        if(link.indexOf('help/report/room/') === 0)
        {
            const parts = link.split('/');

            if(parts.length >= 5)
            {
                const roomId = parseInt(parts[3]);
                const roomName = decodeURIComponent(parts.slice(4).join('/'));

                this.reportRoom(roomId, roomName, '');
            }
        }
    }

    // --- ILinkEventTracker ---

    /**
	 * Send a message through the communication manager
	 */
    sendMessage(composer: IMessageComposer<any>): void
    {
        if(this._communication?.connection)
        {
            this._communication.connection.send(composer);
        }
    }

    // --- Utility methods ---

    /**
	 * Add a message event to the communication manager
	 *
	 * @param event The message event to register
	 */
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communication)
        {
            this._communication.addMessageEvent(event);
        }
    }

    /**
	 * Dispose of this component and all sub-managers
	 */
    dispose(): void
    {
        if(this._disposed) return;

        // Remove link event tracker
        this.context.removeLinkEventTracker(this);

        // Dispose message handler
        if(this._messageHandler)
        {
            this._messageHandler.dispose();
            this._messageHandler = null;
        }

        // Dispose sub-managers
        if(this._cfhManager)
        {
            this._cfhManager.dispose();
            this._cfhManager = null;
        }

        if(this._guideManager)
        {
            this._guideManager.dispose();
            this._guideManager = null;
        }

        if(this._nameChangeController)
        {
            this._nameChangeController.dispose();
            this._nameChangeController = null;
        }

        if(this._sanctionInfo)
        {
            this._sanctionInfo.dispose();
            this._sanctionInfo = null;
        }

        // Dispose registry handlers
        if(this._chatEventHandler)
        {
            this._chatEventHandler.dispose();
            this._chatEventHandler = null;
        }

        if(this._imEventHandler)
        {
            this._imEventHandler.dispose();
            this._imEventHandler = null;
        }

        this._communication = null;

        super.dispose();

        log.debug('HabboHelp disposed');
    }

    // --- Dispose ---

    protected override initComponent(): void
    {
        // Create sub-managers
        this._cfhManager = new CallForHelpManager();
        this._guideManager = new GuideHelpManager();
        this._nameChangeController = new NameChangeController(this._communication);
        this._sanctionInfo = new SanctionInfo();

        // Create registry handlers
        this._chatEventHandler = new ChatEventHandler(this._chatRegistry);
        this._imEventHandler = new InstantMessageEventHandler(this._imRegistry);

        // Create message handler (registers all help events)
        this._messageHandler = new HelpMessageHandler(this, this._communication!);

        // Register link event tracker
        this.context.addLinkEventTracker(this);

        log.debug('HabboHelp initialized');
    }
}
