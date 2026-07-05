/**
 * HeightMapUpdateMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.HeightMapUpdateMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    HeightMapUpdateMessageParser
} from '@habbo/communication/messages/parser/room/engine/HeightMapUpdateMessageParser';

export class HeightMapUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HeightMapUpdateMessageParser);
    }
}
