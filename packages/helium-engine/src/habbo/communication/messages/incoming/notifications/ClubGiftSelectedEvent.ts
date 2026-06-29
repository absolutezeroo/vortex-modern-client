import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ClubGiftSelectedEventParser} from '../../parser/notifications/ClubGiftSelectedEventParser';

/**
 * Event for club gift selected
 *
 * @see source_as_win63/habbo/communication/messages/incoming/catalog/ClubGiftSelectedEvent.as
 */
export class ClubGiftSelectedEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ClubGiftSelectedEventParser);
	}
}
