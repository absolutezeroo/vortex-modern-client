import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IssuePickFailedMessageParser} from '../../parser/moderation/IssuePickFailedMessageParser';

/**
 * Event fired when picking an issue fails.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/IssuePickFailedMessageEvent.as
 */
export class IssuePickFailedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, IssuePickFailedMessageParser);
	}
}
