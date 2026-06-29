import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MOTDNotificationEventParser} from '../../parser/notifications/MOTDNotificationEventParser';

/**
 * Event for Message of the Day notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/MOTDNotificationEvent.as
 */
export class MOTDNotificationEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MOTDNotificationEventParser);
	}
}
