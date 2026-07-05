import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomForwardMessageParser} from '@habbo/communication/messages/parser/room/session/RoomForwardMessageParser';

/**
 * RoomForwardMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.RoomForwardMessageEvent
 */
export class RoomForwardMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomForwardMessageParser);
    }
}
