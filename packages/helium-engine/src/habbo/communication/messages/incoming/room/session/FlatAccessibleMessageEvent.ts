/**
 * FlatAccessibleMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.FlatAccessibleMessageEvent
 *
 * Sent when access to a room is granted (e.g., doorbell answered).
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    FlatAccessibleMessageParser
} from '@habbo/communication/messages/parser/room/session/FlatAccessibleMessageParser';

export class FlatAccessibleMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FlatAccessibleMessageParser);
    }
}
