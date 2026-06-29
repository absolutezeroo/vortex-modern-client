import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CallForHelpPendingCallsMessageParser} from '../../parser/help/CallForHelpPendingCallsMessageParser';

/**
 * Event for pending calls for help list.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/CallForHelpPendingCallsMessageEvent.as
 */
export class CallForHelpPendingCallsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CallForHelpPendingCallsMessageParser);
	}
}
