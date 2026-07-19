import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CallForHelpManager');

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

    private _disposed: boolean = false;

    /**
	 * Whether this manager has been disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _reportedUserId: number = -1;

    get reportedUserId(): number
    {
        return this._reportedUserId;
    }

    set reportedUserId(value: number)
    {
        this._reportedUserId = value;
    }

    private _reportedUserName: string = '';

    get reportedUserName(): string
    {
        return this._reportedUserName;
    }

    set reportedUserName(value: string)
    {
        this._reportedUserName = value;
    }

    private _reportedRoomId: number = -1;

    get reportedRoomId(): number
    {
        return this._reportedRoomId;
    }

    set reportedRoomId(value: number)
    {
        this._reportedRoomId = value;
    }

    private _reportedRoomName: string = '';

    get reportedRoomName(): string
    {
        return this._reportedRoomName;
    }

    set reportedRoomName(value: string)
    {
        this._reportedRoomName = value;
    }

    private _reportedExtraDataId: string = '';

    get reportedExtraDataId(): string
    {
        return this._reportedExtraDataId;
    }

    set reportedExtraDataId(value: string)
    {
        this._reportedExtraDataId = value;
    }

    private _reportedRoomObjectId: number = -1;

    get reportedRoomObjectId(): number
    {
        return this._reportedRoomObjectId;
    }

    set reportedRoomObjectId(value: number)
    {
        this._reportedRoomObjectId = value;
    }

    private _reportedGroupId: number = -1;

    get reportedGroupId(): number
    {
        return this._reportedGroupId;
    }

    set reportedGroupId(value: number)
    {
        this._reportedGroupId = value;
    }

    private _reportedThreadId: number = -1;

    get reportedThreadId(): number
    {
        return this._reportedThreadId;
    }

    set reportedThreadId(value: number)
    {
        this._reportedThreadId = value;
    }

    private _reportedMessageId: number = -1;

    get reportedMessageId(): number
    {
        return this._reportedMessageId;
    }

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
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}
