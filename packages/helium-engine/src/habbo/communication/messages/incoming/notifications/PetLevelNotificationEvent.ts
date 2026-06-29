import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetLevelNotificationEventParser} from '../../parser/notifications/PetLevelNotificationEventParser';

/**
 * Event for pet level notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/PetLevelNotificationEvent.as
 */
export class PetLevelNotificationEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetLevelNotificationEventParser);
	}
}
