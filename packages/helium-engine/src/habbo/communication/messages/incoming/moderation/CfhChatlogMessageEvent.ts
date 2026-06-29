import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CfhChatlogMessageParser} from '../../parser/moderation/CfhChatlogMessageParser';

/**
 * Event for CFH (Call For Help) chatlog data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/CfhChatlogEvent.as
 */
export class CfhChatlogMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CfhChatlogMessageParser);
	}
}
