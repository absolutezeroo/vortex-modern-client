import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {YouAreSpectatorMessageParser} from '@habbo/communication/messages/parser/room/session/YouAreSpectatorMessageParser';

/**
 * YouAreSpectatorMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.YouAreSpectatorMessageEvent
 */
export class YouAreSpectatorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, YouAreSpectatorMessageParser);
    }
}
