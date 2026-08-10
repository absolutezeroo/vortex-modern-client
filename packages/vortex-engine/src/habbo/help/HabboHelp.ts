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
import {IID_HabboFreeFlowChat} from '@iid/IIDHabboFreeFlowChat';
import {UsersMessageEvent} from '@habbo/communication/messages/incoming/room/engine/UsersMessageEvent';
import {RoomEntryInfoMessageEvent} from '@habbo/communication/messages/incoming/room/engine/RoomEntryInfoMessageEvent';
import {RoomReadyMessageEvent} from '@habbo/communication/messages/incoming/room/session/RoomReadyMessageEvent';
import {GetGuestRoomResultMessageEvent} from '@habbo/communication/messages/incoming/navigator/GetGuestRoomResultMessageEvent';
import type {UsersMessageParser} from '@habbo/communication/messages/parser/room/engine/UsersMessageParser';
import type {RoomEntryInfoMessageParser} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import type {RoomReadyMessageParser} from '@habbo/communication/messages/parser/room/session/RoomReadyMessageParser';
import type {GetGuestRoomResultMessageParser} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IMessageComposer} from '@core';
import {GetCfhStatusMessageComposer} from '@habbo/communication/messages/outgoing/help/GetCfhStatusMessageComposer';
import {GetGuideReportingStatusMessageComposer} from '@habbo/communication/messages/outgoing/help/GetGuideReportingStatusMessageComposer';
import {GetPendingCallsForHelpMessageComposer} from '@habbo/communication/messages/outgoing/help/GetPendingCallsForHelpMessageComposer';
import {GuideAdvertisementReadMessageComposer} from '@habbo/communication/messages/outgoing/talent/GuideAdvertisementReadMessageComposer';
import {IgnoreUserMessageComposer} from '@habbo/communication/messages/outgoing/users/IgnoreUserMessageComposer';
import {RemoveFriendMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/RemoveFriendMessageComposer';
import type {CallForHelpDisabledNotifyMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpDisabledNotifyMessageParser';
import type {CallForHelpPendingCallsMessageParser} from '@habbo/communication/messages/parser/help/CallForHelpPendingCallsMessageParser';
import type {CfhTopicsInitMessageParser, ICfhCategory} from '@habbo/communication/messages/parser/help/CfhTopicsInitMessageParser';
import type {GuideReportingStatusMessageParser} from '@habbo/communication/messages/parser/help/GuideReportingStatusMessageParser';

const log = Logger.getLogger('habbo.help.HabboHelp');

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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_EMERGENCY
    public static readonly REPORT_TYPE_EMERGENCY: number = 1;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_GUIDE
    public static readonly REPORT_TYPE_GUIDE: number = 2;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_IM
    public static readonly REPORT_TYPE_IM: number = 3;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_ROOM
    public static readonly REPORT_TYPE_ROOM: number = 4;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_BULLY
    public static readonly REPORT_TYPE_BULLY: number = 6;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_THREAD
    public static readonly REPORT_TYPE_THREAD: number = 7;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_MESSAGE
    public static readonly REPORT_TYPE_MESSAGE: number = 8;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::REPORT_TYPE_PHOTO
    public static readonly REPORT_TYPE_PHOTO: number = 9;

    private _communication: IHabboCommunicationManager | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_roomSessionManager
    private _roomSessionManager: IRoomSessionManager | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_navigator
    private _navigator: IHabboNavigator | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_tracking
    private _tracking: IHabboTracking | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_friendList
    private _friendList: IHabboFriendList | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_freeFlowChat
    private _freeFlowChat: IHabboFreeFlowChat | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];
    private _imRegistry: InstantMessageRegistry;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/HabboHelp.as::_chatEventHandler
    private _chatEventHandler: ChatEventHandler | null = null;
    private _imEventHandler: InstantMessageEventHandler | null = null;
    private _cfhManager: CallForHelpManager | null = null;
    private _guideManager: GuideHelpManager | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/HabboHelp.as::_nameChangeController
    private _nameChangeController: NameChangeController | null = null;
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_sanctionInfo
    private _sanctionInfo: SanctionInfo | null = null;
    private _messageHandler: HelpMessageHandler | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/HabboHelp.as::_currentRoomId
    private _currentRoomId: number = 0;

    constructor(context: IContext)
    {
        super(context);

        this._userRegistry = new UserRegistry();
        this._chatRegistry = new ChatRegistry();
        this._imRegistry = new InstantMessageRegistry();
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_chatRegistry
    private _chatRegistry: ChatRegistry;

    /**
	 * The chat registry for CFH reports
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get chatRegistry()
    get chatRegistry(): ChatRegistry
    {
        return this._chatRegistry;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_userRegistry
    private _userRegistry: UserRegistry;

    // --- Getters ---

    /**
	 * The user registry for CFH reports
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get userRegistry()
    get userRegistry(): UserRegistry
    {
        return this._userRegistry;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_outsideRoom
    private _outsideRoom: boolean = false;

    /**
	 * Whether the user is outside a room
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get outsideRoom()
    get outsideRoom(): boolean
    {
        return this._outsideRoom;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::set outsideRoom()
    set outsideRoom(value: boolean)
    {
        this._outsideRoom = value;
    }

    /**
	 * The instant message registry for CFH reports
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get instantMessageRegistry()
    get instantMessageRegistry(): InstantMessageRegistry
    {
        return this._imRegistry;
    }

    /**
	 * The Call For Help manager
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get callForHelpManager()
    get callForHelpManager(): CallForHelpManager | null
    {
        return this._cfhManager;
    }

    /**
	 * The guide help manager
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get guideHelpManager()
    get guideHelpManager(): GuideHelpManager | null
    {
        return this._guideManager;
    }

    /**
	 * The communication manager
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get communicationManager()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::get freeFlowChat()
    get freeFlowChat(): IHabboFreeFlowChat | null
    {
        return this._freeFlowChat;
    }

    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as
    // ~15 further public members confirmed absent (the soundManager getter - it has no DI
    // dependency wired here yet, unlike the getters above; newUserTourEnabled/newIdentity/
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get ownUserId()
    get ownUserId(): number
    {
        return this._nameChangeController?.ownUserId ?? 0;
    }

    /**
	 * ILinkEventTracker - link pattern prefix
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get linkPattern()
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
            new ComponentDependency(
                IID_HabboFreeFlowChat,
                (freeFlowChat: IHabboFreeFlowChat | null) =>
                {
                    this._freeFlowChat = freeFlowChat;
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportBully()
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

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportUser()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportRoom()
    // TODO(AS3): AS3 sets the four `reported*` fields directly and then opens the *new* CFH flow
    // via `TopicsFlowHelpController.openReportingContentReasonCategory(4)`. That controller is
    // unported, so this routes through the manager's own `reportRoom()` — the older flow, which
    // asks the server for pending calls first and would open `emergency_help_request`. Same
    // substitution as `reportUser()`/`reportThread()`/`reportMessage()` below.
    reportRoom(roomId: number, roomName: string, roomDescription: string): void
    {
        if(this._cfhManager)
        {
            this._cfhManager.reportRoom(roomId, roomName, roomDescription);
        }
    }

    /**
	 * Report a forum thread
	 *
	 * @param groupId The group ID
	 * @param threadId The thread ID
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportThread()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportMessage()
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
	 * @param extraDataId The selfie's extra data id (its share URL)
	 * @param message The free-text report message
	 * @param roomId The room the selfie was reported from
	 * @param photoAuthorId The user who took the selfie — the reported user
	 * @param roomObjectId The selfie furniture's room object id
	 * @returns Whether the report was submitted
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportSelfie()
    reportSelfie(extraDataId: string, message: string, roomId: number, photoAuthorId: number, roomObjectId: number): boolean
    {
        if(this._cfhManager)
        {
            if(message.length < this.getInteger('help.cfh.length.minimum', 15))
            {
                // AS3 alerts rather than logging: refusing the report silently leaves the user
                // staring at a form that did nothing.
                this._windowManager?.alert('${generic.alert.title}', '${help.cfh.error.msgtooshort}', 0, null);

                return false;
            }

            this._cfhManager.reportSelfie(extraDataId, message, roomId, photoAuthorId, roomObjectId);

            return true;
        }

        return false;
    }

    /**
	 * Report a photo
	 *
	 * @param extraDataId The photo's extra data id
	 * @param topicId The selected CFH topic id
	 * @param roomId The room the photo was reported from
	 * @param photoAuthorId The user who took the photo — the reported user
	 * @param roomObjectId The photo furniture's room object id
	 * @returns Whether the report was submitted
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::reportPhoto()
    reportPhoto(extraDataId: string, topicId: number, roomId: number, photoAuthorId: number, roomObjectId: number): boolean
    {
        if(this._cfhManager)
        {
            if(topicId === 0)
            {
                this._windowManager?.alert('${generic.alert.title}', '${help.cfh.error.notopic}', 0, null);

                return false;
            }

            this._cfhManager.reportPhoto(extraDataId, topicId, roomId, photoAuthorId, roomObjectId);

            return true;
        }

        return false;
    }

    // --- CFH request pipeline ---

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_pendingReportType
    // Name derived: obfuscated as `_SafeStr_4910` in every tree. It holds the `REPORT_TYPE_*` that
    // the pending-calls reply is to proceed with, which is what the name records.
    private _pendingReportType: number = 0;

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_reportMessage
    private _reportMessage: IMessageComposer<any> | null = null;

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_guideReportingType
    // Name derived (`_SafeStr_6147`). Write-only in AS3 too: `queryForGuideReportingStatus()`
    // stores its argument and nothing reads it back. Kept so the member is not silently missing.
    private _guideReportingType: number = -1;

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::_callForHelpCategories
    private _callForHelpCategories: ICfhCategory[] = [];

    /**
	 * The CFH topic tree, as sent by the server at login
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get callForHelpCategories()
    get callForHelpCategories(): ICfhCategory[]
    {
        return this._callForHelpCategories;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get guardiansEnabled()
    get guardiansEnabled(): boolean
    {
        return this.getBoolean('guardians.enabled');
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get newUserTourEnabled()
    get newUserTourEnabled(): boolean
    {
        return this.getBoolean('guide.help.new.user.tour.enabled');
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get newIdentity()
    get newIdentity(): boolean
    {
        return this.getInteger('new.identity', 0) > 0;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get citizenshipEnabled()
    get citizenshipEnabled(): boolean
    {
        return this.getBoolean('talent.track.citizenship.enabled');
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get safetyQuizDisabled()
    get safetyQuizDisabled(): boolean
    {
        return this.getBoolean('safety_quiz.disabled');
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get reportedUserId()
    get reportedUserId(): number
    {
        return this._cfhManager?.reportedUserId ?? -1;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::set reportedUserId()
    set reportedUserId(value: number)
    {
        if(this._cfhManager) this._cfhManager.reportedUserId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get reportedUserName()
    get reportedUserName(): string
    {
        return this._cfhManager?.reportedUserName ?? '';
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get reportedRoomId()
    get reportedRoomId(): number
    {
        return this._cfhManager?.reportedRoomId ?? -1;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::set reportedRoomId()
    set reportedRoomId(value: number)
    {
        if(this._cfhManager) this._cfhManager.reportedRoomId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get reportedExtraDataId()
    get reportedExtraDataId(): string
    {
        return this._cfhManager?.reportedExtraDataId ?? '';
    }

    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::get reportedRoomObjectId()
    get reportedRoomObjectId(): number
    {
        return this._cfhManager?.reportedRoomObjectId ?? -1;
    }

    /**
	 * Park a report composer until the pending-calls reply clears it for sending
	 *
	 * The photo report is the one that uses this: it must not go out before the server has said
	 * how many reports the user already has open.
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::setReportMessage()
    setReportMessage(composer: IMessageComposer<any> | null): void
    {
        this._reportMessage = composer;
    }

    /**
	 * Ask the server how many reports this user already has open
	 *
	 * Every report route funnels through here: the reply decides whether the report form opens
	 * (`proceedWithReporting()`) or the user is shown their existing reports instead.
	 *
	 * @param reportType The `REPORT_TYPE_*` to proceed with once the reply lands
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::queryForPendingCallsForHelp()
    queryForPendingCallsForHelp(reportType: number): void
    {
        this._pendingReportType = reportType;

        this.sendMessage(new GetPendingCallsForHelpMessageComposer());
    }

    /**
	 * Ask the server whether the guide-reporting route is open to this user
	 *
	 * @param reportType The report type the answer applies to
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::queryForGuideReportingStatus()
    queryForGuideReportingStatus(reportType: number): void
    {
        this._guideReportingType = reportType;

        // Both, in this order — asking about guide reporting also marks the guide advertisement
        // as read.
        this.sendMessage(new GuideAdvertisementReadMessageComposer());
        this.sendMessage(new GetGuideReportingStatusMessageComposer());
    }

    /**
	 * Ignore, and unfriend, whoever the pending report is filed against
	 *
	 * Called once a report is submitted.
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::ignoreAndUnfriendReportedUser()
    ignoreAndUnfriendReportedUser(): void
    {
        const userId = this._cfhManager?.reportedUserId ?? -1;

        if(userId <= 0) return;

        this.sendMessage(new IgnoreUserMessageComposer(userId));

        // `getFriendById()` is this port's name for AS3's `getFriend()`.
        if(this._friendList?.getFriendById(userId))
        {
            this.sendMessage(new RemoveFriendMessageComposer(userId));
        }
    }

    /**
	 * Request the user's own sanction status
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::requestSanctionInfo()
    requestSanctionInfo(): void
    {
        this.sendMessage(new GetCfhStatusMessageComposer());
    }

    /**
	 * Handle the server's pending-calls answer
	 *
	 * With nothing open the report proceeds; otherwise the user is shown what they already have
	 * open and asked to keep or discard it. A photo report (type 9) is allowed to stack up to
	 * three, which is the one asymmetry in the rule.
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onPendingCallsForHelp()
    handlePendingCallsForHelp(parser: CallForHelpPendingCallsMessageParser): void
    {
        if(parser.callCount === 0 || (this._pendingReportType === HabboHelp.REPORT_TYPE_PHOTO && parser.callCount < 3))
        {
            this.proceedWithReporting();

            return;
        }

        const calls = parser.calls;
        let message = '';

        for(let i = 0; i < calls.length && i < 10; i++)
        {
            message += calls[i].message;

            if(i < calls.length - 1 && i < 9) message += '\n';
        }

        this._cfhManager?.showPendingRequest(message);
    }

    /**
	 * Open whatever the stored report type calls for, now that the server has cleared it
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::proceedWithReporting()
    private proceedWithReporting(): void
    {
        switch(this._pendingReportType)
        {
            case HabboHelp.REPORT_TYPE_EMERGENCY:
            case HabboHelp.REPORT_TYPE_IM:
            case HabboHelp.REPORT_TYPE_ROOM:
            case HabboHelp.REPORT_TYPE_THREAD:
            case HabboHelp.REPORT_TYPE_MESSAGE:
                this._cfhManager?.showEmergencyHelpRequest(this._pendingReportType);
                break;

            case HabboHelp.REPORT_TYPE_GUIDE:
                this._guideManager?.openReportWindow();
                break;

            case HabboHelp.REPORT_TYPE_PHOTO:
                // The photo report was parked by `CallForHelpManager.reportPhoto()`; this is the
                // only place it goes out.
                if(this._reportMessage)
                {
                    this.sendMessage(this._reportMessage);
                    this._reportMessage = null;
                }
                break;
        }

        this._pendingReportType = 0;
    }

    /**
	 * Handle the guide-reporting status answer
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onGuideReportingStatus()
    handleGuideReportingStatus(parser: GuideReportingStatusMessageParser): void
    {
        switch(parser.statusCode)
        {
            // TODO(AS3): status 0 calls `toggleNewHelpWindow()`, which opens
            // `TopicsFlowHelpController` (933 lines,
            // sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/TopicsFlowHelpController.as).
            // That controller is the whole "new CFH flow" UI and is unported; every
            // `openReporting*()` entry point on it is unported with it.
            case 0:
                log.warn('Guide reporting status 0: the new help window (TopicsFlowHelpController) is not ported');
                break;

            // TODO(AS3): status 1 calls `guideHelpManager.showPendingTicket(parser.pendingTicket)`.
            // Neither half exists here: `GuideHelpManager` has no `showPendingTicket()`, and
            // `GuideReportingStatusMessageParser` does not read a `pendingTicket` field off the
            // wire — porting this needs the parser widened first.
            case 1:
                log.warn('Guide reporting status 1: pending-ticket display is not ported');
                break;

            default:
                this._guideManager?.showFeedback(parser.localizationCode);
                break;
        }
    }

    /**
	 * Store the CFH topic tree the server sends at login
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onCfhTopics()
    handleCfhTopics(parser: CfhTopicsInitMessageParser): void
    {
        this._callForHelpCategories = parser.callForHelpCategories;
    }

    /**
	 * Tell the user that calling for help has been disabled for them
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::onCallForHelpDisabledNotify()
    handleCallForHelpDisabledNotify(parser: CallForHelpDisabledNotifyMessageParser): void
    {
        this._windowManager?.simpleAlert(
            '${help.emergency.global_mute.caption}',
            '${help.emergency.global_mute.subtitle}',
            '${help.emergency.global_mute.message}',
            '${help.emergency.global_mute.link}',
            parser.infoUrl
        );
    }

    /**
	 * Request a guide
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::requestGuide()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::startNameChange()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::showHabboWay()
    showHabboWay(): void
    {
        log.debug('Show Habbo Way');
    }

    /**
	 * Show the safety booklet
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::showSafetyBooklet()
    showSafetyBooklet(): void
    {
        log.debug('Show safety booklet');
    }

    /**
	 * Show the tour popup
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::showTourPopup()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::linkReceived()
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
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::sendMessage()
    sendMessage(composer: IMessageComposer<any>): void
    {
        if(this._communication?.connection)
        {
            this._communication.connection.send(composer);
        }
    }

    // --- Registry feeds ---

    /**
	 * Register every real user in the room into the CFH user registry
	 *
	 * Own avatar and non-user entities (pets, bots) are skipped, as in AS3.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::onUsers()
    private onUsers(event: IMessageEvent): void
    {
        const parser = event.parser as UsersMessageParser | null;

        if(!parser) return;

        for(let i = 0; i < parser.userCount; i++)
        {
            const user = parser.getUser(i);

            if(!user) continue;

            if(user.webID !== this.ownUserId && user.userType === 1)
            {
                this._userRegistry.registerUser(user.webID, user.name, user.figure);
            }
        }
    }

    /**
	 * Register the room being entered, before its name is known
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::onRoomReady()
    private onRoomReady(event: IMessageEvent): void
    {
        const parser = event.parser as RoomReadyMessageParser | null;

        if(!parser) return;

        this._userRegistry.registerRoom(parser.roomId, '');
    }

    /**
	 * Fill in the room name once the guest-room data arrives
	 *
	 * `registerRoom()` back-fills it onto the users registered by `onRoomReady()`.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::onGuestRoomResult()
    private onGuestRoomResult(event: IMessageEvent): void
    {
        const parser = event.parser as GetGuestRoomResultMessageParser | null;
        const data = parser?.data ?? null;

        if(!data) return;

        this._userRegistry.registerRoom(data.flatId, data.roomName);
    }

    /**
	 * Track the room the user is in — the room id every report is filed against
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/HabboHelp.as::onRoomEnter()
    private onRoomEnter(event: IMessageEvent): void
    {
        const parser = event.parser as RoomEntryInfoMessageParser | null;

        if(!parser) return;

        this._currentRoomId = parser.guestRoomId;
    }

    // --- Utility methods ---

    /**
	 * Add a message event to the communication manager
	 *
	 * @param event The message event to register
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communication)
        {
            this._communication.addMessageEvent(event);
            this._messageEvents.push(event);
        }
    }

    /**
	 * Dispose of this component and all sub-managers
	 */
    // AS3: .../src/com/sulake/habbo/help/HabboHelp.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        // Remove link event tracker
        this.context.removeLinkEventTracker(this);

        // AS3: HabboHelp.dispose() unregisters its own `_messageEvents` vector — the four
        // registry feeds above plus the two InstantMessageEventHandler registers through
        // addMessageEvent(). HelpMessageHandler owns (and removes) its own set separately.
        if(this._communication)
        {
            for(const event of this._messageEvents)
            {
                this._communication.removeMessageEvent(event);
            }
        }

        this._messageEvents = [];

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
        // AS3 registers these five in initComponent() itself, ahead of the sub-managers, because
        // they feed the CFH registries the report flow reads back. TODO(AS3): the sixth,
        // `onGameStageStarting` (snowwar's own user list), needs habbo/game, which is unported.
        this.addMessageEvent(new UsersMessageEvent(this.onUsers.bind(this)));
        this.addMessageEvent(new RoomReadyMessageEvent(this.onRoomReady.bind(this)));
        this.addMessageEvent(new GetGuestRoomResultMessageEvent(this.onGuestRoomResult.bind(this)));
        this.addMessageEvent(new RoomEntryInfoMessageEvent(this.onRoomEnter.bind(this)));

        // Create sub-managers
        // AS3 passes itself: the manager sends every report through `HabboHelp.sendMessage()` and
        // reads `guardiansEnabled` off it.
        this._cfhManager = new CallForHelpManager(this);
        this._guideManager = new GuideHelpManager();
        this._nameChangeController = new NameChangeController(this._communication);
        this._sanctionInfo = new SanctionInfo();

        // Create registry handlers — both take the component, as AS3 does: they subscribe
        // themselves (room chat / the two IM events) rather than waiting to be called.
        this._chatEventHandler = new ChatEventHandler(this);
        this._imEventHandler = new InstantMessageEventHandler(this);

        // Create message handler (registers all help events)
        this._messageHandler = new HelpMessageHandler(this, this._communication!);

        // Register link event tracker
        this.context.addLinkEventTracker(this);

        log.debug('HabboHelp initialized');
    }
}
