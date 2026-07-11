import type {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {IHabboFreeFlowChat} from '../IHabboFreeFlowChat';
import {ChatItem} from './ChatItem';

/**
 * Room chat event listener. Listens to RoomSessionChatEvent on the
 * roomSessionManager and creates ChatItem instances for insertion
 * into the free flow chat system.
 *
 * Handles timestamp collision avoidance to ensure unique ordering
 * of chat items that arrive at the same millisecond.
 *
 * @see source_as_win63/habbo/freeflowchat/data/ChatEventHandler.as
 */
export class ChatEventHandler
{
    public static readonly CHAT_STYLE_SNOWWAR_RED: number = 120;
    public static readonly CHAT_STYLE_SNOWWAR_BLUE: number = 121;

    private _freeFlowChat: IHabboFreeFlowChat | null;
    private _lastTimeStamp: number = 0;
    private _timeStampCollisionCount: number = 0;
    private _onRoomChatBound: (event: RoomSessionChatEvent) => void;

    constructor(freeFlowChat: IHabboFreeFlowChat)
    {
        this._freeFlowChat = freeFlowChat;

        this._onRoomChatBound = this.onRoomChat.bind(this);

        if(this._freeFlowChat.roomSessionManager)
        {
            this._freeFlowChat.roomSessionManager.sessionEvents.on(
                'RSCE_CHAT_EVENT',
                this._onRoomChatBound
            );
        }
    }

    get disposed(): boolean
    {
        return this._freeFlowChat === null;
    }

    /**
	 * Dispose of the handler and remove event listeners.
	 */
    dispose(): void
    {
        if(this.disposed) return;

        if(this._freeFlowChat?.roomSessionManager)
        {
            this._freeFlowChat.roomSessionManager.sessionEvents.off(
                'RSCE_CHAT_EVENT',
                this._onRoomChatBound
            );
        }

        this._freeFlowChat = null;
    }

    /**
	 * Handler for RoomSessionChatEvent. Creates a ChatItem with a
	 * collision-avoidant timestamp and inserts it into the free flow chat.
	 *
	 * @param event The room session chat event
	 */
    private onRoomChat(event: RoomSessionChatEvent): void
    {
        if(!this._freeFlowChat) return;

        const senderData = this._freeFlowChat.roomSessionManager
            ?.getSession(event.session.roomId)
            ?.userDataManager.getUserDataByIndex(event.userId) ?? null;

        if(senderData && this._freeFlowChat.sessionDataManager?.isBlocked(senderData.webID)) return;

        // AS3 passes event.userId directly (not senderData.roomObjectId) as the
        // object id here - in freeflowchat's RoomSessionChatEvent, userId already
        // is the room-local object id, distinct from ChatBubbleFactory's use of
        // userData.roomObjectId elsewhere for the same lookup.
        const roomObject = this._freeFlowChat.roomEngine?.getRoomObject(event.session.roomId, event.userId, 100) ?? null;
        const userLocation = roomObject?.getLocation() ?? null;

        const now = Math.floor(performance.now());

        if(now === this._lastTimeStamp)
        {
            this._timeStampCollisionCount++;
        }
        else
        {
            this._timeStampCollisionCount = 0;
        }

        this._freeFlowChat.insertChat(
            new ChatItem(event, now + this._timeStampCollisionCount, userLocation, event.extraParam)
        );

        this._lastTimeStamp = now;
    }
}
