import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserBannedMessageEventParser} from '../../parser/notifications/UserBannedMessageEventParser';

/**
 * Event for user banned message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/UserBannedMessageEvent.as
 */
export class UserBannedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserBannedMessageEventParser);
	}
}
