import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BadgesMessageParser} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/badges/BadgesEvent.as
 */
export class BadgesMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BadgesMessageParser);
	}
}
