import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ClubGiftNotificationEventParser} from '../../parser/notifications/ClubGiftNotificationEventParser';

/**
 * Event for club gift notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/ClubGiftNotificationEvent.as
 */
export class ClubGiftNotificationEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ClubGiftNotificationEventParser);
	}
}
