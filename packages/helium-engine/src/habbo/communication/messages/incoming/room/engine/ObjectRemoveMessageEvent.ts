/**
 * ObjectRemoveMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectRemoveMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/ObjectRemoveMessageParser';

export class ObjectRemoveMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ObjectRemoveMessageParser);
    }
}
