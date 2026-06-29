import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InstantMessageErrorEventParser} from '../../parser/friendlist/InstantMessageErrorEventParser';

/**
 * Event handler for instant message errors.
 * Fired when a message fails to send.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/InstantMessageErrorEvent.as
 */
export class InstantMessageErrorEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InstantMessageErrorEventParser);
	}
}
