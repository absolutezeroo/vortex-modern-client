import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionMessageMessageParser} from '../../parser/help/GuideSessionMessageMessageParser';

/**
 * Event for guide session chat messages.
 * Fired when a new message is received in a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionMessageMessageEvent.as
 */
export class GuideSessionMessageMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionMessageMessageParser);
	}
}
