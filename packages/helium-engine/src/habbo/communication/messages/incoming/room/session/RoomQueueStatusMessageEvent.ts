import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomQueueStatusMessageParser} from '@habbo/communication/messages/parser/room/session/RoomQueueStatusMessageParser';

/**
 * RoomQueueStatusMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.RoomQueueStatusMessageEvent
 */
export class RoomQueueStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomQueueStatusMessageParser);
    }
}
