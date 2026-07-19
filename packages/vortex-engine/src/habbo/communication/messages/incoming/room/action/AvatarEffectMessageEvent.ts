/**
 * AvatarEffectMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.AvatarEffectMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    AvatarEffectMessageEventParser
} from '@habbo/communication/messages/parser/room/action/AvatarEffectMessageEventParser';

export class AvatarEffectMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AvatarEffectMessageEventParser);
    }
}
