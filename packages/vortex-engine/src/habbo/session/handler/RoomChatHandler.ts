import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {ChatMessageEvent} from '../../communication/messages/incoming/room/chat/ChatMessageEvent';
import {ShoutMessageEvent} from '../../communication/messages/incoming/room/chat/ShoutMessageEvent';
import {WhisperMessageEvent} from '../../communication/messages/incoming/room/chat/WhisperMessageEvent';
import {PetRespectNotificationEvent} from '../../communication/messages/incoming/notifications/PetRespectNotificationEvent';
import {PetSupplementedNotificationEvent} from '../../communication/messages/incoming/users/PetSupplementedNotificationEvent';
import type {
    PetSupplementedNotificationEventParser
} from '../../communication/messages/parser/users/PetSupplementedNotificationEventParser';

// Parsers
import type {
    PetRespectNotificationEventParser
} from '../../communication/messages/parser/notifications/PetRespectNotificationEventParser';
import type {ChatMessageEventParser, IChatLink} from '../../communication/messages/parser/room/chat/ChatMessageEventParser';

// Events
import {RoomSessionChatEvent} from '../events/RoomSessionChatEvent';

/**
 * Room chat handler
 *
 * Based on AS3: com.sulake.habbo.session.handler.RoomChatHandler
 *
 * Handles chat messages (ChatMessageEvent, WhisperMessageEvent, ShoutMessageEvent)
 * and dispatches RoomSessionChatEvent.
 */
export class RoomChatHandler extends BaseHandler
{
    private _messageEvents: IMessageEvent[] = [];

    constructor(connection: IConnection | null, listener: IRoomHandlerListener)
    {
        super(connection, listener);

        if(connection === null)
        {
            return;
        }

        // Register chat message events
        this.addMessageEvent(connection, new ChatMessageEvent(this.onRoomChat.bind(this)));
        this.addMessageEvent(connection, new WhisperMessageEvent(this.onRoomWhisper.bind(this)));
        this.addMessageEvent(connection, new ShoutMessageEvent(this.onRoomShout.bind(this)));
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/handler/RoomChatHandler.as::RoomChatHandler()
        this.addMessageEvent(connection, new PetSupplementedNotificationEvent(this.onPetSupplementedNotification.bind(this)));
        this.addMessageEvent(connection, new PetRespectNotificationEvent(this.onPetRespectNotification.bind(this)));

        // TODO: Register additional message events when implemented
        // this.addMessageEvent(connection, new RespectNotificationMessageEvent(this.onRespectNotification.bind(this)));
        // this.addMessageEvent(connection, new FloodControlMessageEvent(this.onFloodControl.bind(this)));
    }

    override dispose(): void
    {
        if(this.connection)
        {
            for(const event of this._messageEvents)
            {
                this.connection.removeMessageEvent(event);
            }
        }
        this._messageEvents = [];

        super.dispose();
    }

    private addMessageEvent(connection: IConnection, event: IMessageEvent): void
    {
        connection.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    /**
	 * Helper method to dispatch a chat event
	 */
    // AS3: sources/win63_version/habbo/session/handler/RoomChatHandler.as (all 3 onRoom* handlers)
    // `links` passes parser.links straight through, unmodified - AS3 never
    // flattens it, only display text plus the url/isTrusted it needs to open.
    private dispatchChatEvent(
        userId: number,
        text: string,
        chatType: number,
        styleId: number,
        links: IChatLink[] | null = null,
        extraParam: number = -1
    ): void
    {
        const session = this.listener.getSession(this.roomId);
        if(session === null)
        {
            return;
        }

        if(this.listener.sessionEvents)
        {
            this.listener.sessionEvents.emit(
                RoomSessionChatEvent.RSCE_CHAT_EVENT,
                new RoomSessionChatEvent(
                    RoomSessionChatEvent.RSCE_CHAT_EVENT,
                    session,
                    userId,
                    text,
                    chatType,
                    styleId,
                    links,
                    extraParam
                )
            );
        }
    }

    /**
     * Scratching a pet, or feeding it a treat, surfaces as a bubble over the pet. Which of the
     * two it was is not a field on the message: AS3 infers it from the pet's own figure type, so
     * `isTreat()` is a look at the payload rather than a flag.
     *
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/handler/RoomChatHandler.as::onPetRespectNotification()
     */
    private onPetRespectNotification(event: IMessageEvent): void
    {
        const parser = event.parser as PetRespectNotificationEventParser | null;

        if(parser === null || parser.petData === null) return;

        const session = this.listener.getSession(this.roomId);

        if(session === null) return;

        const petData = session.userDataManager.getPetUserData(parser.petData.id);

        if(petData === null) return;

        const chatType = parser.isTreat()
            ? RoomSessionChatEvent.CHAT_TYPE_PET_TREAT
            : RoomSessionChatEvent.CHAT_TYPE_PET_RESPECT;

        // AS3 passes no giver here, unlike its supplement sibling one method down.
        this.dispatchChatEvent(petData.roomObjectId, '', chatType, 1);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/handler/RoomChatHandler.as::onPetSupplementedNotification()
    // Water/light/treat given to a pet surfaces as a bubble over the *pet*, so the chat event's
    // object id is the pet's room object and the giver's is passed as the extra parameter. AS3
    // starts from PET_REVIVE and switches on `supplementType - 2`, leaving anything outside 2..4 on
    // that default — kept exactly, including the fall-through-free default.
    private onPetSupplementedNotification(event: IMessageEvent): void
    {
        const parser = event.parser as PetSupplementedNotificationEventParser | null;

        if(parser === null) return;

        const session = this.listener.getSession(this.roomId);

        if(session === null) return;

        let chatType = RoomSessionChatEvent.CHAT_TYPE_PET_REVIVE;

        switch(parser.supplementType - 2)
        {
            case 0:
                chatType = RoomSessionChatEvent.CHAT_TYPE_PET_REVIVE;
                break;
            case 1:
                chatType = RoomSessionChatEvent.CHAT_TYPE_PET_REBREED;
                break;
            case 2:
                chatType = RoomSessionChatEvent.CHAT_TYPE_PET_SPEED;
                break;
        }

        const petData = session.userDataManager.getPetUserData(parser.petId);

        if(petData === null) return;

        const giverData = session.userDataManager.getUserData(parser.userId);
        const giverObjectId = giverData !== null ? giverData.roomObjectId : -1;

        this.dispatchChatEvent(petData.roomObjectId, '', chatType, 1, null, giverObjectId);
    }

    /**
	 * Handle normal chat message
	 */
    private onRoomChat(event: IMessageEvent): void
    {
        const chatEvent = event as ChatMessageEvent;
        if(chatEvent === null)
        {
            return;
        }

        const parser = chatEvent.parser as ChatMessageEventParser;
        if(parser === null)
        {
            return;
        }

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/handler/RoomChatHandler.as::onRoomChat()
        // Closes the loop opened by RoomSession.sendChatMessage(), which records a send time per
        // tracking id. Without this the entries are never removed and chat-lag is never reported.
        if(parser.trackingId !== -1)
        {
            this.listener?.getSession(this.roomId)?.receivedChatWithTrackingId(parser.trackingId);
        }

        this.dispatchChatEvent(
            parser.userId,
            parser.text,
            RoomSessionChatEvent.CHAT_TYPE_SPEAK,
            parser.styleId,
            parser.links
        );
    }

    /**
	 * Handle whisper message
	 */
    private onRoomWhisper(event: IMessageEvent): void
    {
        const whisperEvent = event as WhisperMessageEvent;
        if(whisperEvent === null)
        {
            return;
        }

        const parser = whisperEvent.parser as ChatMessageEventParser;
        if(parser === null)
        {
            return;
        }

        this.dispatchChatEvent(
            parser.userId,
            parser.text,
            RoomSessionChatEvent.CHAT_TYPE_WHISPER,
            parser.styleId,
            parser.links
        );
    }

    /**
	 * Handle shout message
	 */
    private onRoomShout(event: IMessageEvent): void
    {
        const shoutEvent = event as ShoutMessageEvent;
        if(shoutEvent === null)
        {
            return;
        }

        const parser = shoutEvent.parser as ChatMessageEventParser;
        if(parser === null)
        {
            return;
        }

        this.dispatchChatEvent(
            parser.userId,
            parser.text,
            RoomSessionChatEvent.CHAT_TYPE_SHOUT,
            parser.styleId,
            parser.links
        );
    }
}
