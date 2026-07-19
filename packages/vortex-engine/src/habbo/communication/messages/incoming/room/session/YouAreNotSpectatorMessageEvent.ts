import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {YouAreNotSpectatorMessageParser} from '@habbo/communication/messages/parser/room/session/YouAreNotSpectatorMessageParser';

/**
 * YouAreNotSpectatorMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.YouAreNotSpectatorMessageEvent
 */
export class YouAreNotSpectatorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, YouAreNotSpectatorMessageParser);
    }
}
