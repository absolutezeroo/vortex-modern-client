import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserChatlogMessageParser} from '../../parser/moderation/UserChatlogMessageParser';

/**
 * Event for user chatlog data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/UserChatlogEvent.as
 */
export class UserChatlogMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserChatlogMessageParser);
	}
}
