/**
 * DanceMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.DanceMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DanceMessageEventParser} from '@habbo/communication/messages/parser/room/action/DanceMessageEventParser';

export class DanceMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, DanceMessageEventParser);
    }
}
