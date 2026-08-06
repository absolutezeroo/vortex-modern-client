import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.help.CallForHelpManager');

/**
 * Call For Help manager
 *
 * Manages CFH report submission, tracking reported user/room/thread/message data.
 * Coordinates with HabboHelp for pending calls and message sending.
 *
 * @see source_as_win63/habbo/help/CallForHelpManager.as
 */
export class CallForHelpManager
{
    private static readonly MAX_CHARS: number = 253;

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

    /**
	 * Report a bully
	 *
	 * @param userId The reported user ID
	 * @param roomId The room ID where the incident occurred
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportBully()
    reportBully(userId: number, roomId: number): void
    {
        this._reportedUserId = userId;
        this._reportedRoomId = roomId;
        log.debug('Report bully - userId:', userId, 'roomId:', roomId);
    }

    /**
	 * Report a user
	 *
	 * @param userId The reported user ID
	 * @param roomId The room ID
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportUser()
    reportUser(userId: number, roomId: number): void
    {
        this._reportedUserId = userId;
        this._reportedRoomId = roomId;
        log.debug('Report user - userId:', userId, 'roomId:', roomId);
    }

    /**
	 * Report a room
	 *
	 * @param roomId The room ID
	 * @param roomName The room name
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::reportRoom()
    reportRoom(roomId: number, roomName: string): void
    {
        this._reportedRoomId = roomId;
        this._reportedRoomName = roomName;
        this._reportedUserId = -1;
        this._reportedUserName = '';
        log.debug('Report room - roomId:', roomId, 'roomName:', roomName);
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
        log.debug('Report thread - groupId:', groupId, 'threadId:', threadId);
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
        log.debug('Report message - groupId:', groupId, 'threadId:', threadId, 'messageId:', messageId);
    }

    /**
	 * Report a selfie
	 *
	 * @param extraDataId The extra data ID
	 * @param description The selfie description
	 * @param userId The reported user ID
	 * @param roomObjectId The room object ID
	 * @param roomId The room ID
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/CallForHelpManager.as::reportSelfie()
    // sends a message composer built from all 5 args via `_habboHelp.sendMessage(...)`; this port
    // doesn't send anything yet (no HabboHelp wiring in this class), so roomId has nowhere to go.
    reportSelfie(extraDataId: string, description: string, userId: number, roomObjectId: number, _roomId: number): void
    {
        this._reportedExtraDataId = extraDataId;
        this._reportedRoomObjectId = roomObjectId;
        log.debug('Report selfie - extraDataId:', extraDataId, 'userId:', userId);
    }

    /**
	 * Report a photo
	 *
	 * @param extraDataId The extra data ID
	 * @param topicId The topic ID
	 * @param userId The reported user ID
	 * @param roomObjectId The room object ID
	 * @param roomId The room ID
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/CallForHelpManager.as::reportPhoto()
    // builds a message composer from all 5 args plus sends it via `_habboHelp.setReportMessage(...)`
    // then `_habboHelp.queryForPendingCallsForHelp(9)`; neither is wired up in this class yet.
    reportPhoto(extraDataId: string, topicId: number, userId: number, roomObjectId: number, _roomId: number): void
    {
        this._reportedExtraDataId = extraDataId;
        this._reportedRoomObjectId = roomObjectId;
        log.debug('Report photo - extraDataId:', extraDataId, 'topicId:', topicId);
    }

    /**
	 * Dispose of this manager
	 */
    // AS3: .../src/com/sulake/habbo/help/CallForHelpManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}
