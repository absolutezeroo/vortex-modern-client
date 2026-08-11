import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectorWindow} from '@core/window/components/ISelectorWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {CallForHelpFromForumMessageMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromForumMessageMessageComposer';
import {CallForHelpFromForumThreadMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromForumThreadMessageComposer';
import {CallForHelpFromIMMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromIMMessageComposer';
import {CallForHelpFromPhotoMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromPhotoMessageComposer';
import {CallForHelpFromSelfieMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromSelfieMessageComposer';
import {CallForHelpMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpMessageComposer';
import {DeletePendingCallsForHelpMessageComposer} from '@habbo/communication/messages/outgoing/help/DeletePendingCallsForHelpMessageComposer';
import {ReportBullyMessageComposer} from '@habbo/communication/messages/outgoing/help/ReportBullyMessageComposer';
import {IgnoreUserMessageComposer} from '@habbo/communication/messages/outgoing/users/IgnoreUserMessageComposer';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IIlluminaInputWidget} from '@habbo/window/widgets/IIlluminaInputWidget';

import {ChatReportController} from './ChatReportController';
import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.CallForHelpManager');

/**
 * Call For Help manager
 *
 * Manages CFH report submission, tracking reported user/room/thread/message data.
 * Coordinates with HabboHelp for pending calls and message sending.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/CallForHelpManager.as
 */
export class CallForHelpManager
{
    private static readonly MAX_CHARS: number = 253;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_chatReportController
    private _chatReportController: ChatReportController | null = null;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_reportType
    // Name derived (`_SafeStr_4910`): the `REPORT_TYPE_*` the open form is filing.
    private _reportType: number = 0;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_helpMessage
    // Name derived (`_SafeStr_5626`): the free-text the reporter typed.
    private _helpMessage: string = '';

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_selectedTopicId
    // Name derived (`_SafeStr_6084`): the topic picked in the form, as opposed to
    // `_preselectedTopicId`, which is the one the caller asked to preselect.
    private _selectedTopicId: number = 0;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::CallForHelpManager()
    // AS3 also subscribes the three CFH reply events here; this port centralises every help
    // subscription in `HelpMessageHandler` instead, which is where those three now live.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
        this._chatReportController = new ChatReportController(habboHelp, this.onChatReportEvent);
    }

    /**
	 * The chat-line picker this manager drives
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get chatReportController()
    get chatReportController(): ChatReportController | null
    {
        return this._chatReportController;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_disposed
    private _disposed: boolean = false;

    /**
	 * Whether this manager has been disposed
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedUserId
    private _reportedUserId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedUserId()
    get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedUserId()
    set reportedUserId(value: number)
    {
        this._reportedUserId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_reportedUserName
    private _reportedUserName: string = '';

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedUserName()
    get reportedUserName(): string
    {
        return this._reportedUserName;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedUserName()
    set reportedUserName(value: string)
    {
        this._reportedUserName = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedRoomId
    private _reportedRoomId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedRoomId()
    get reportedRoomId(): number
    {
        return this._reportedRoomId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedRoomId()
    set reportedRoomId(value: number)
    {
        this._reportedRoomId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_reportedRoomName
    private _reportedRoomName: string = '';

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedRoomName()
    get reportedRoomName(): string
    {
        return this._reportedRoomName;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedRoomName()
    set reportedRoomName(value: string)
    {
        this._reportedRoomName = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedExtraDataId
    private _reportedExtraDataId: string = '';

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedExtraDataId()
    get reportedExtraDataId(): string
    {
        return this._reportedExtraDataId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedExtraDataId()
    set reportedExtraDataId(value: string)
    {
        this._reportedExtraDataId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedRoomObjectId
    private _reportedRoomObjectId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedRoomObjectId()
    get reportedRoomObjectId(): number
    {
        return this._reportedRoomObjectId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedRoomObjectId()
    set reportedRoomObjectId(value: number)
    {
        this._reportedRoomObjectId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedGroupId
    private _reportedGroupId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedGroupId()
    get reportedGroupId(): number
    {
        return this._reportedGroupId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedGroupId()
    set reportedGroupId(value: number)
    {
        this._reportedGroupId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedThreadId
    private _reportedThreadId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedThreadId()
    get reportedThreadId(): number
    {
        return this._reportedThreadId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedThreadId()
    set reportedThreadId(value: number)
    {
        this._reportedThreadId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/help/CallForHelpManager.as::_reportedMessageId
    private _reportedMessageId: number = -1;

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::get reportedMessageId()
    get reportedMessageId(): number
    {
        return this._reportedMessageId;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::set reportedMessageId()
    set reportedMessageId(value: number)
    {
        this._reportedMessageId = value;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_reportedRoomDescription
    private _reportedRoomDescription: string = '';

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::_preselectedTopicId
    // Name derived: the identifier is obfuscated in every tree (`_SafeStr_9629`). `reportUser()`
    // stores its third argument here and `showEmergencyHelpRequest()` reads it back to preselect
    // the matching entry of the form's `topic_selector`, which is what the name records.
    private _preselectedTopicId: number = 0;

    /**
	 * Report a bully
	 *
	 * With guardians enabled this opens the guide-reporting flow instead of the CFH one; without
	 * them it falls through to an ordinary emergency report on topic 123.
	 *
	 * @param userId The reported user ID
	 * @param roomId The room ID where the incident occurred
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportBully()
    reportBully(userId: number, roomId: number): void
    {
        if(this._habboHelp?.guardiansEnabled)
        {
            this._reportedUserId = userId;
            this._reportedRoomId = roomId;

            this._habboHelp.queryForGuideReportingStatus(3);
        }
        else
        {
            this.reportUser(userId, 1, 123);
        }
    }

    /**
	 * Report a user
	 *
	 * @param userId The reported user ID
	 * @param cfhCategory The CFH report type the reply should proceed with (`REPORT_TYPE_*`)
	 * @param topicId The topic to preselect in the report form
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportUser()
    reportUser(userId: number, cfhCategory: number, topicId: number): void
    {
        this._reportedUserId = userId;
        this._reportedRoomId = -1;
        this._preselectedTopicId = topicId;

        this._habboHelp?.queryForPendingCallsForHelp(cfhCategory);
    }

    /**
	 * Report a room
	 *
	 * @param roomId The room ID
	 * @param roomName The room name
	 * @param roomDescription The room description, shown back in the report form's room panel
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportRoom()
    reportRoom(roomId: number, roomName: string, roomDescription: string): void
    {
        this._reportedRoomId = roomId;
        this._reportedRoomName = roomName;
        this._reportedRoomDescription = roomDescription;
        this._reportedUserId = -1;
        this._reportedUserName = '';

        this._habboHelp?.queryForPendingCallsForHelp(4);
    }

    /**
	 * Report a forum thread
	 *
	 * @param groupId The group ID
	 * @param threadId The thread ID
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportThread()
    reportThread(groupId: number, threadId: number): void
    {
        this._reportedGroupId = groupId;
        this._reportedThreadId = threadId;

        this._habboHelp?.queryForPendingCallsForHelp(7);
    }

    /**
	 * Report a forum message
	 *
	 * @param groupId The group ID
	 * @param threadId The thread ID
	 * @param messageId The message ID
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportMessage()
    reportMessage(groupId: number, threadId: number, messageId: number): void
    {
        this._reportedGroupId = groupId;
        this._reportedThreadId = threadId;
        this._reportedMessageId = messageId;

        this._habboHelp?.queryForPendingCallsForHelp(8);
    }

    /**
	 * Report a selfie
	 *
	 * Sent straight out, with no pending-calls round trip: a selfie report carries its own
	 * message, so there is no form to open.
	 *
	 * The argument order is not the wire order — AS3 shuffles it into the composer, and the two
	 * disagree in three of five positions. `CallForHelpFromSelfieMessageComposer` documents how
	 * the AS3 call site and the server's parser pin it down.
	 *
	 * @param extraDataId The selfie's extra data id (its share URL)
	 * @param message The free-text report message
	 * @param roomId The room the selfie was reported from
	 * @param photoAuthorId The user who took the selfie — the reported user
	 * @param roomObjectId The selfie furniture's room object id
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportSelfie()
    reportSelfie(extraDataId: string, message: string, roomId: number, photoAuthorId: number, roomObjectId: number): void
    {
        // AS3 stores nothing on the manager here — the two `_reported*` assignments this port used
        // to make had no counterpart. The fields they wrote are fed by
        // `HabboHelp.startPhotoReportingInNewCfhFlow()`, which is the flow that reads them back.
        this._habboHelp?.sendMessage(
            new CallForHelpFromSelfieMessageComposer(extraDataId, roomId, photoAuthorId, message, roomObjectId)
        );
    }

    /**
	 * Report a photo
	 *
	 * Unlike the selfie report this one is *staged* rather than sent: the composer is parked on
	 * `HabboHelp` and only goes out once the server has answered the pending-calls query, which is
	 * how the client avoids stacking a tenth open report. See
	 * `HabboHelp.proceedWithReporting()`.
	 *
	 * @param extraDataId The photo's extra data id
	 * @param topicId The selected CFH topic id
	 * @param roomId The room the photo was reported from
	 * @param photoAuthorId The user who took the photo — the reported user
	 * @param roomObjectId The photo furniture's room object id
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportPhoto()
    reportPhoto(extraDataId: string, topicId: number, roomId: number, photoAuthorId: number, roomObjectId: number): void
    {
        // The two trailing strings are the reporter's own name and e-mail, which only the
        // guest-reporting flow fills in; the in-client one sends them empty, as AS3 does here.
        this._habboHelp?.setReportMessage(
            new CallForHelpFromPhotoMessageComposer(extraDataId, roomId, photoAuthorId, topicId, roomObjectId, '', '')
        );

        this._habboHelp?.queryForPendingCallsForHelp(9);
    }

    /**
	 * Open the emergency help request form
	 *
	 * Reports "no user" on the emergency category with no topic preselected — the form is where
	 * the user picks both.
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::openEmergencyHelpRequest()
    openEmergencyHelpRequest(): void
    {
        this.reportUser(0, 1, -1);
    }

    /**
	 * Show the emergency help request form for a report type
	 *
	 * Type 6 gets the guardians-only `bully_report` layout; everything else gets
	 * `emergency_help_request`. Which of the two side panels is shown depends on the type — a user
	 * report shows the user list, a room report the room panel, and the forum reports neither.
	 *
	 * @param reportType The `REPORT_TYPE_*` the pending-calls reply proceeded with
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::showEmergencyHelpRequest()
    showEmergencyHelpRequest(reportType: number): void
    {
        this.closeWindow();

        this._reportType = reportType;

        const layout = reportType === 6 ? 'bully_report' : 'emergency_help_request';
        const window = this._habboHelp?.getXmlWindow(layout) as IWindowContainer | null;

        if(!window)
        {
            log.error(`showEmergencyHelpRequest: getXmlWindow("${layout}") returned null - layout not registered?`);

            return;
        }

        this._window = window;

        if(reportType === 6)
        {
            this._window.procedure = this.onBullyReportEvent;
        }
        else
        {
            this._window.procedure = this.onEmergencyHelpRequestEvent;

            const input = this.getMessageInput();

            if(input) input.maxChars = CallForHelpManager.MAX_CHARS;
        }

        this._window.center();

        const topicSelector = this._window.findChildByName('topic_selector') as ISelectorWindow | null;

        if(topicSelector)
        {
            const preselected = topicSelector.getSelectableByName(`${this._preselectedTopicId}`);

            if(preselected) topicSelector.setSelected(preselected);

            // Topic 123 is the bullying topic; with guardians on it has its own flow and must not
            // be reachable from this form.
            const bullyingTopic = topicSelector.getSelectableByName('123');

            if(bullyingTopic && this._habboHelp?.guardiansEnabled) bullyingTopic.visible = false;
        }

        switch(reportType)
        {
            case 1:
                this.showPanels(true, false);
                break;

            case 3:
            case 7:
            case 8:
                this.showPanels(false, false);
                break;

            case 4:
                this.showPanels(false, true);
                break;

            case 6:
                this.populateUserList();
                break;
        }
    }

    /**
	 * Show the "you already have reports open" prompt
	 *
	 * @param message The concatenated pending call messages
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::showPendingRequest()
    showPendingRequest(message: string): void
    {
        this.closeWindow();

        const window = this._habboHelp?.getXmlWindow('pending_request') as IWindowContainer | null;

        if(!window)
        {
            log.error('showPendingRequest: getXmlWindow("pending_request") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const request = this._window.findChildByName('request_message');

        if(request) request.caption = message;

        this._window.center();
        this._window.procedure = this.onPendingRequestEvent;
    }

    /**
	 * Show the "your reporting privileges are suspended" notice
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::showAbusiveNotice()
    // No caller yet: AS3 reaches this from the same reporting flow, and nothing in the ported half
    // dispatches it. Kept because it is one of the four CFH layouts and the window is trivial.
    showAbusiveNotice(): void
    {
        this.closeWindow();

        const window = this._habboHelp?.getXmlWindow('abusive_notice') as IWindowContainer | null;

        if(!window) return;

        this._window = window;
        this._window.center();

        const close = this._window.findChildByName('header_button_close');

        if(close) close.visible = false;

        this._window.procedure = this.onAbusiveNoticeEvent;
    }

    /**
	 * Swap the form between its wide (with side panel) and narrow layouts
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::showPanels()
    private showPanels(showUserPanel: boolean, showRoomPanel: boolean): void
    {
        if(!this._window) return;

        const userPanel = this._window.findChildByName('user_panel');
        const roomPanel = this._window.findChildByName('room_panel');
        const wide = showUserPanel || showRoomPanel;

        const submitWide = this._window.findChildByName('submit_box_wide');
        const submitNarrow = this._window.findChildByName('submit_box_narrow');
        const separator = this._window.findChildByName('separator');

        if(submitWide) submitWide.visible = wide;
        if(submitNarrow) submitNarrow.visible = !wide;
        if(separator) separator.visible = wide;
        if(roomPanel) roomPanel.visible = showRoomPanel;
        if(userPanel) userPanel.visible = showUserPanel;

        if(showRoomPanel && roomPanel)
        {
            const list = roomPanel as IItemListWindow;
            const name = list.getListItemByName('room_name');
            const description = list.getListItemByName('room_description');

            if(name) name.caption = this._reportedRoomName ?? '';
            if(description) description.caption = this._reportedRoomDescription ?? '';
        }

        if(showUserPanel) this.populateUserList();

        // AS3 hard-codes the narrow width here rather than reading it off the layout.
        if(!wide) this._window.width = 301;
    }

    /**
	 * Fill the "who are you reporting" list from the CFH user registry
	 *
	 * The currently-reported user is moved to the top and highlighted with `blend`.
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::populateUserList()
    private populateUserList(): void
    {
        if(!this._window || !this._habboHelp) return;

        const userList = this._window.findChildByName('user_list') as IItemListWindow | null;

        if(!userList) return;

        const template = userList.getListItemAt(0) as IWindowContainer | null;

        if(!template) return;

        userList.removeListItems();

        let insertAt = 0;

        for(const entry of this._habboHelp.userRegistry.getRegistry().values())
        {
            const row = template.clone() as IWindowContainer;
            const isReported = entry.userId === this._reportedUserId;

            row.name = entry.userId.toString();
            row.blend = isReported ? 1 : 0;
            row.procedure = this.onUserSelectEvent;

            const userName = row.findChildByName('user_name');

            if(userName) userName.caption = entry.userName;

            const roomName = row.findChildByName('room_name');

            if(roomName)
            {
                roomName.id = entry.roomId;
                roomName.caption = entry.roomName !== ''
                    ? this._habboHelp.localization?.getLocalizationWithParams(
                        'help.emergency.main.step.two.room.name', '', 'room_name', entry.roomName
                    ) ?? ''
                    : '';
            }

            if(isReported) this._reportedRoomId = entry.roomId;

            const avatar = row.findChildByName('user_avatar') as IWidgetWindow | null;
            const avatarWidget = avatar?.widget as IAvatarImageWidget | null;

            if(avatarWidget) avatarWidget.figure = entry.figure;

            userList.addListItemAt(row, insertAt);

            // Once the reported user has been placed at the top, everyone after them appends
            // below rather than pushing them back down.
            if(isReported) insertAt = 1;
        }
    }

    /**
	 * Repaint the user list's highlight after the selection changed
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::refreshUserList()
    private refreshUserList(): void
    {
        const userList = this._window?.findChildByName('user_list') as IItemListWindow | null;

        if(!userList) return;

        for(let i = 0; i < userList.numListItems; i++)
        {
            const row = userList.getListItemAt(i);

            if(row) row.blend = parseInt(row.name, 10) === this._reportedUserId ? 1 : 0;
        }
    }

    /**
	 * Hand over to the chat-line picker
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::showChatReportTool()
    private showChatReportTool(): void
    {
        this.closeWindow();

        this._chatReportController?.show(this._habboHelp?.ownUserId ?? 0, this._reportedUserId, this._reportType);
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::closeWindow()
    private closeWindow(): void
    {
        this._window?.dispose();
        this._window = null;
    }

    /**
	 * The form's message input, which lives inside a widget window
	 */
    // TS-only: AS3 inlines this cast at each of its two use sites; extracted so the widget
    // unwrapping appears once.
    private getMessageInput(): IIlluminaInputWidget | null
    {
        const holder = this._window?.findChildByName('help_message') as IWidgetWindow | null;

        return (holder?.widget as IIlluminaInputWidget | null) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onAbusiveNoticeEvent()
    private onAbusiveNoticeEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(window.name === 'close_button') this.closeWindow();
    };

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onEmergencyHelpRequestEvent()
    private onEmergencyHelpRequestEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'submit_button':
                if(!this.saveEmergencyHelpRequestData()) return;

                this.basicInfoDone();
                break;

            case 'header_button_close':
                this.closeWindow();
                break;
        }
    };

    /**
	 * The guardians-only bully form, which submits without a topic or a chat selection
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onBullyReportEvent()
    private onBullyReportEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'submit_button':
                if(this._reportedUserId > 0)
                {
                    this._habboHelp?.sendMessage(new IgnoreUserMessageComposer(this._reportedUserId));
                    this._habboHelp?.sendMessage(new ReportBullyMessageComposer(this._reportedUserId, this._reportedRoomId));
                    this.closeWindow();

                    break;
                }

                this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${guide.bully.request.usermissing}', 0, null);
                break;

            case 'header_button_close':
                this.closeWindow();
                break;
        }
    };

    /**
	 * The chat picker's own submit/close, handed to it as its window procedure
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onChatReportEvent()
    private onChatReportEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'submit_button':
                if((this._chatReportController?.collectSelectedEntries(this._reportType, -1).length ?? 0) === 0)
                {
                    this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.chatmissing}', 0, null);

                    return;
                }

                this.submitCallForHelp();
                this._chatReportController?.closeWindow();
                this.closeWindow();
                break;

            case 'header_button_close':
                this._chatReportController?.closeWindow();
                break;
        }
    };

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onUserSelectEvent()
    private onUserSelectEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.selectUserToReport(window as IWindowContainer);
    };

    /**
	 * Toggle which user the report is filed against
	 *
	 * Clicking the already-selected user clears the selection rather than re-picking them.
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::selectUserToReport()
    private selectUserToReport(row: IWindowContainer | null): void
    {
        if(this._window === null || this._window.name !== 'emergency_help_request' || row === null) return;

        const userId = parseInt(row.name, 10);

        if(this._reportedUserId === userId)
        {
            this._reportedUserId = 0;
            this._reportedRoomId = -1;
        }
        else
        {
            this._reportedUserId = userId;
            this._reportedRoomId = row.findChildByName('room_name')?.id ?? -1;
        }

        this.refreshUserList();
    }

    /**
	 * Decide whether the report needs chat lines picked before it can be sent
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::basicInfoDone()
    private basicInfoDone(): void
    {
        const chatRequired = this.isChatSelectionRequired();

        if(this._reportType === 3)
        {
            if(!this._habboHelp?.instantMessageRegistry.hasUserChatted(this._reportedUserId))
            {
                this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.nochathistory}', 0, null);
            }
        }
        else if(
            chatRequired
			&& !this._habboHelp?.chatRegistry.hasContentWithoutChatFromUser(this._habboHelp?.ownUserId ?? 0)
			&& this._habboHelp?.chatRegistry.hasContentWithoutChatFromUser(this._reportedUserId)
        )
        {
            this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.nochathistory}', 0, null);

            return;
        }

        if(chatRequired) this.showChatReportTool();
        else this.submitCallForHelp();
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::isChatSelectionRequired()
    private isChatSelectionRequired(): boolean
    {
        // Forum and room reports have no chat to attach.
        if(this._reportType === 7 || this._reportType === 8 || this._reportType === 4) return false;

        return this._reportedUserId <= 0
			|| (this._habboHelp?.chatRegistry.getItemsByUser(this._reportedUserId).length ?? 0) > 0
			|| this._reportType === 3;
    }

    /**
	 * Validate the form and latch what it holds
	 *
	 * @returns false when the form is incomplete, or when a confirmation dialog has taken over
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::saveEmergencyHelpRequestData()
    private saveEmergencyHelpRequestData(): boolean
    {
        if(this._window === null || this._window.name !== 'emergency_help_request') return false;

        this._helpMessage = this.getMessageInput()?.message ?? '';

        if(this._helpMessage === '')
        {
            this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.nomsg}', 0, null);

            return false;
        }

        if(this._helpMessage.length < (this._habboHelp?.getInteger('help.cfh.length.minimum', 15) ?? 15))
        {
            this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.msgtooshort}', 0, null);

            return false;
        }

        this._selectedTopicId = 0;

        const selected = (this._window.findChildByName('topic_selector') as ISelectorWindow | null)?.getSelected() ?? null;

        if(selected) this._selectedTopicId = parseInt((selected as unknown as IWindow).name, 10);

        if(this._selectedTopicId === 0)
        {
            this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${help.cfh.error.notopic}', 0, null);

            return false;
        }

        if(this._reportType === 8 || this._reportType === 7) return true;

        // Ported verbatim, including the contradiction: `_reportType != 8 && _reportType == 7`
        // can only hold when the type is 7, which the line above has already returned on — so the
        // left half of this test is dead in AS3 too, and only the room-report half can fire.
        if(
            (this._reportedUserId <= 0 && (this._reportType !== 8 && this._reportType === 7))
			|| (this._reportType === 4 && !(this._habboHelp?.getBoolean('room.report.enabled') ?? false))
        )
        {
            this._habboHelp?.windowManager?.alert('${generic.alert.title}', '${guide.bully.request.usermissing}', 0, null);

            return false;
        }

        // Reporting a friend asks for confirmation first; the flow resumes in the callback, so
        // this returns false to stop the caller carrying on behind the dialog.
        if(this._habboHelp?.friendList?.getFriendById(this._reportedUserId))
        {
            this._habboHelp?.windowManager?.confirm(
                '${help.cfh.unfriend.confirm.title}',
                '${help.cfh.unfriend.confirm.message}',
                0x10 | 0x20,
                this.onFriendReportConfirmation
            );

            return false;
        }

        return true;
    }

    /**
	 * Send the report the open form describes
	 *
	 * Which composer goes out is decided by the report type; the room id prefers whatever room the
	 * picked chat lines came from over the one the form was opened with.
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::submitCallForHelp()
    private submitCallForHelp(): void
    {
        this.closeWindow();

        switch(this._reportType)
        {
            case 1:
            case 4:
            {
                const pickedRoomId = (this._chatReportController?.reportedRoomId ?? -1) <= 0
                    ? this._reportedRoomId
                    : this._chatReportController!.reportedRoomId;

                this._habboHelp?.sendMessage(new CallForHelpMessageComposer(
                    this._helpMessage,
                    this._selectedTopicId,
                    this._reportedUserId,
                    pickedRoomId,
                    this._chatReportController?.collectSelectedEntries(this._reportType, -1) ?? [],
                    '',
                    ''
                ));
                break;
            }

            case 3:
                this._habboHelp?.sendMessage(new CallForHelpFromIMMessageComposer(
                    this._helpMessage,
                    this._selectedTopicId,
                    this._reportedUserId,
                    this._chatReportController?.collectSelectedEntries(3, -1) ?? [],
                    '',
                    ''
                ));
                break;

            case 7:
                this._habboHelp?.sendMessage(new CallForHelpFromForumThreadMessageComposer(
                    this._reportedGroupId,
                    this._reportedThreadId,
                    this._selectedTopicId,
                    this._helpMessage,
                    '',
                    ''
                ));
                break;

            case 8:
                this._habboHelp?.sendMessage(new CallForHelpFromForumMessageMessageComposer(
                    this._reportedGroupId,
                    this._reportedThreadId,
                    this._reportedMessageId,
                    this._selectedTopicId,
                    this._helpMessage,
                    '',
                    ''
                ));
                break;
        }

        this._habboHelp?.ignoreAndUnfriendReportedUser();
    }

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onFriendReportConfirmation()
    private onFriendReportConfirmation = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(event.type === 'WE_OK') this.basicInfoDone();

        dialog.dispose();
    };

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::onPendingReuqestEvent()
    // AS3's method name carries a typo ("Reuqest"); the trace above keeps it, the method here does
    // not — the rule asks the trace to name the real member, not that the port repeat the slip.
    private onPendingRequestEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'keep_button':
            case 'header_button_close':
                this.closeWindow();
                break;

            case 'discard_button':
                this.deletePendingCallsForHelp();
                this.closeWindow();
                break;
        }
    };

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::deletePendingCallsForHelp()
    private deletePendingCallsForHelp(): void
    {
        this._habboHelp?.sendMessage(new DeletePendingCallsForHelpMessageComposer());
    }

    /**
	 * Dispose of this manager
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        if(this._chatReportController)
        {
            this._chatReportController.dispose();
            this._chatReportController = null;
        }

        this._habboHelp = null;
        this._disposed = true;
    }
}
