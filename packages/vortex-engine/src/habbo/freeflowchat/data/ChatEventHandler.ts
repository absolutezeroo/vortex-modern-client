import type {IRoomSession} from '@habbo/session/IRoomSession';
import {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import {GameChatEvent} from '@habbo/game/events/GameChatEvent';
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
    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::CHAT_STYLE_SNOWWAR_RED
    public static readonly CHAT_STYLE_SNOWWAR_RED: number = 120;
    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::CHAT_STYLE_SNOWWAR_BLUE
    public static readonly CHAT_STYLE_SNOWWAR_BLUE: number = 121;

    private _freeFlowChat: IHabboFreeFlowChat | null;
    private _lastTimeStamp: number = 0;
    private _timeStampCollisionCount: number = 0;
    private _onRoomChatBound: (event: RoomSessionChatEvent) => void;
    // TS-only: AS3 subscribes a method reference; the port needs a stable bound one to unsubscribe.
    private _onGameChatBound: (event: GameChatEvent) => void;

    constructor(freeFlowChat: IHabboFreeFlowChat)
    {
        this._freeFlowChat = freeFlowChat;

        this._onRoomChatBound = this.onRoomChat.bind(this);
        this._onGameChatBound = this.gameEventHandler.bind(this);

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::ChatEventHandler()
        // AS3 dereferences roomSessionManager here with no null check, because HabboFreeFlowChat
        // declares that dependency as required — initComponent(), which builds this handler, cannot
        // run before it resolves. The getter is still typed nullable, hence the assertion; guarding
        // instead would turn a loud failure back into a silent one, which is the bug this fixes.
        this._freeFlowChat.roomSessionManager!.sessionEvents.on(
            'RSCE_CHAT_EVENT',
            this._onRoomChatBound
        );

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::ChatEventHandler()
        // Guarded exactly as AS3 guards it: the games component is optional and attaches after this
        // one, so `gameManager` can legitimately be null here and there is simply no game chat.
        this._freeFlowChat.gameManager?.events.on(GameChatEvent.GAME_CHAT, this._onGameChatBound);
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._freeFlowChat === null;
    }

    /**
	 * Dispose of the handler and remove event listeners.
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::dispose()
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

        this._freeFlowChat?.gameManager?.events.off(GameChatEvent.GAME_CHAT, this._onGameChatBound);

        this._freeFlowChat = null;
    }

    /**
	 * Handler for RoomSessionChatEvent. Creates a ChatItem with a
	 * collision-avoidant timestamp and inserts it into the free flow chat.
	 *
	 * @param event The room session chat event
	 */
    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::onRoomChat()
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

    /**
     * A snow-war line. It has no room session and no room object behind it — the speaker is a game
     * object — so the bubble is given its identity directly: a forced screen x (the team's side of
     * the arena), colour, figure and name, and a chat style picked from the team.
     *
     * The `null` session is AS3's own: `new RoomSessionChatEvent("RSCE_CHAT_EVENT", null, …)`. The
     * port's constructor types it non-null because every other caller has one, and nothing on this
     * path reads it — `ChatItem` takes the fields it needs off the event and stops there.
     */
    // AS3: .../src/com/sulake/habbo/freeflowchat/data/ChatEventHandler.as::gameEventHandler()
    private gameEventHandler(event: GameChatEvent): void
    {
        if(!this._freeFlowChat) return;

        const styleId = event.teamId === 1
            ? ChatEventHandler.CHAT_STYLE_SNOWWAR_BLUE
            : ChatEventHandler.CHAT_STYLE_SNOWWAR_RED;
        const chatEvent = new RoomSessionChatEvent(
            RoomSessionChatEvent.RSCE_CHAT_EVENT,
            null as unknown as IRoomSession,
            event.userId,
            event.message,
            0,
            styleId
        );

        this._freeFlowChat.insertChat(
            new ChatItem(
                chatEvent,
                Math.floor(performance.now()),
                null,
                0,
                event.locX,
                event.color,
                event.figure,
                event.name
            )
        );
    }
}
