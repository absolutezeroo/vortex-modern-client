/**
 * FloorHeightMapMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.FloorHeightMapMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    FloorHeightMapMessageParser
} from '@habbo/communication/messages/parser/room/engine/FloorHeightMapMessageParser';

export class FloorHeightMapMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FloorHeightMapMessageParser);
    }
}
