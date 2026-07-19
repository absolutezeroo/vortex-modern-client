/**
 * RoomReadyMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.RoomReadyMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomReadyMessageParser} from '@habbo/communication/messages/parser/room/session/RoomReadyMessageParser';

export class RoomReadyMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomReadyMessageParser);
    }
}
