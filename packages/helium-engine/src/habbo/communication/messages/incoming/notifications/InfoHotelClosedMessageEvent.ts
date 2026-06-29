import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InfoHotelClosedMessageEventParser} from '../../parser/notifications/InfoHotelClosedMessageEventParser';

/**
 * Event for hotel closed notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/availability/InfoHotelClosedMessageEvent.as
 */
export class InfoHotelClosedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InfoHotelClosedMessageEventParser);
	}
}
