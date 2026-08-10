import {Logger} from '@core/utils/Logger';
import {CallForHelpFromPhotoMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromPhotoMessageComposer';
import {CallForHelpFromSelfieMessageComposer} from '@habbo/communication/messages/outgoing/help/CallForHelpFromSelfieMessageComposer';

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

    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::CallForHelpManager()
    // AS3 also builds a ChatReportController and subscribes the three CFH reply events here; both
    // are the window half of the flow and are still unported — see the TODO(AS3) on
    // `showEmergencyHelpRequest()`.
    constructor(habboHelp: HabboHelp)
    {
        this._habboHelp = habboHelp;
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
	 * @param reportType The `REPORT_TYPE_*` the pending-calls reply proceeded with
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/CallForHelpManager.as::showEmergencyHelpRequest()
    // builds `emergency_help_request` (or `bully_report` for type 6), preselects the topic
    // selector from `_preselectedTopicId`, hides topic 123 when guardians are on, and shows the
    // user or room panel per type via `showPanels()`/`populateUserList()`. All four layouts ship
    // (`emergency_help_request_xml`, `bully_report_xml`, `pending_request_xml`,
    // `abusive_notice_xml`), so this is a window port, not a missing-asset gap. Submitting it
    // additionally needs `ChatReportController` (`chat_report_xml`), which selects the chat lines
    // the report is filed against.
    showEmergencyHelpRequest(reportType: number): void
    {
        log.warn('showEmergencyHelpRequest: the CFH report form is not ported - report type', reportType, 'was dropped');
    }

    /**
	 * Show the "you already have reports open" prompt
	 *
	 * @param message The concatenated pending call messages
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/CallForHelpManager.as::showPendingRequest()
    // builds `pending_request`, puts `message` in its `request_message` caption and wires
    // keep/discard; discard sends DeletePendingCallsForHelpMessageComposer. Same window port as
    // `showEmergencyHelpRequest()` above.
    showPendingRequest(message: string): void
    {
        log.warn('showPendingRequest: the pending-reports prompt is not ported - server said:', message);
    }

    /**
	 * Dispose of this manager
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._habboHelp = null;
        this._disposed = true;
    }
}
