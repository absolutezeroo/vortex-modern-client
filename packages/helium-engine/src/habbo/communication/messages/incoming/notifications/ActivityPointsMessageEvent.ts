import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ActivityPointsMessageParser} from '../../parser/notifications/ActivityPointsMessageParser';

/**
 * Event handler for ActivityPoints message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent.as
 */
export class ActivityPointsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ActivityPointsMessageParser);
	}
}
