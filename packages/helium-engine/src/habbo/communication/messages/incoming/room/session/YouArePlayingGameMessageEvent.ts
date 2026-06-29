import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {YouArePlayingGameMessageParser} from '@habbo/communication/messages/parser/room/session/YouArePlayingGameMessageParser';

/**
 * YouArePlayingGameMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.YouArePlayingGameMessageEvent
 */
export class YouArePlayingGameMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, YouArePlayingGameMessageParser);
	}
}
