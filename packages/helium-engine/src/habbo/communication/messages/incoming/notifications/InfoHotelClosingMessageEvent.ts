import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InfoHotelClosingMessageEventParser} from '../../parser/notifications/InfoHotelClosingMessageEventParser';

/**
 * Event for hotel closing notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/availability/InfoHotelClosingMessageEvent.as
 */
export class InfoHotelClosingMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InfoHotelClosingMessageEventParser);
	}
}
