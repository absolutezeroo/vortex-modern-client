import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatCreatedMessageParser} from '../../parser/navigator/FlatCreatedMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/FlatCreatedEvent.as
 */
export class FlatCreatedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FlatCreatedMessageParser);
	}
}
