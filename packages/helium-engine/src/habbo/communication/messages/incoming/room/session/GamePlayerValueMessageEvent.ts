import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GamePlayerValueMessageParser} from '@habbo/communication/messages/parser/room/session/GamePlayerValueMessageParser';

/**
 * GamePlayerValueMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.GamePlayerValueMessageEvent
 */
export class GamePlayerValueMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GamePlayerValueMessageParser);
	}
}
