import {Logger} from '@core/utils/Logger';
import type {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {IHabboFreeFlowChat} from '../IHabboFreeFlowChat';
import {ChatItem} from './ChatItem';

const log = Logger.getLogger('ChatEventHandler');

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

        // TODO: When IRoomEngine.getRoomObject is available, resolve user location
        // const roomObject = this._freeFlowChat.roomEngine?.getRoomObject(event.session.roomId, event.userId, 100);
        // const userLocation = roomObject?.getLocation() ?? null;
        const userLocation = null;

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
