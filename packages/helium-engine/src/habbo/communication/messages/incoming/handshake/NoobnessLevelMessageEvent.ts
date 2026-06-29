import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NoobnessLevelMessageParser} from '../../parser/handshake/NoobnessLevelMessageParser';

/**
 * Event handler for noobness level message
 * Indicates user's experience level (new user status)
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/NoobnessLevelMessageEvent.as
 */
export class NoobnessLevelMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NoobnessLevelMessageParser);
	}
}
