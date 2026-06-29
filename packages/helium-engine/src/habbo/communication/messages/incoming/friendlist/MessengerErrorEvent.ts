import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MessengerErrorMessageParser} from '../../parser/friendlist/MessengerErrorMessageParser';

/**
 * Event handler for messenger errors.
 * Fired when a messenger operation fails.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/MessengerErrorEvent.as
 */
export class MessengerErrorEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MessengerErrorMessageParser);
	}
}
