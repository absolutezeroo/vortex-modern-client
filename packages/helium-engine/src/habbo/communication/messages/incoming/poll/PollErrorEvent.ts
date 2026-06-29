import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PollErrorEventParser} from '../../parser/poll/PollErrorEventParser';

/**
 * Poll error event
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/PollErrorEvent.as
 */
export class PollErrorEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PollErrorEventParser);
	}
}
