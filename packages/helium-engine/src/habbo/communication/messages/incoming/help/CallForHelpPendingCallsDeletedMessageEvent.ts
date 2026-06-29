import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	CallForHelpPendingCallsDeletedMessageParser
} from '../../parser/help/CallForHelpPendingCallsDeletedMessageParser';

/**
 * Event indicating all pending calls for help have been deleted.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/CallForHelpPendingCallsDeletedMessageEvent.as
 */
export class CallForHelpPendingCallsDeletedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CallForHelpPendingCallsDeletedMessageParser);
	}
}
