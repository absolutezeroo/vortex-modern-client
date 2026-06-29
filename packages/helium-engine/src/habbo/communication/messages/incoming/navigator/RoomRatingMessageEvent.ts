import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomRatingMessageParser} from '../../parser/navigator/RoomRatingMessageParser';

/**
 * Event handler for RoomRating message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/RoomRatingEvent.as
 */
export class RoomRatingMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomRatingMessageParser);
	}
}
