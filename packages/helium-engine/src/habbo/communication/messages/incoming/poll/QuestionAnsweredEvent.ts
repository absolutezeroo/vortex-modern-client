import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestionAnsweredEventParser} from '../../parser/poll/QuestionAnsweredEventParser';

/**
 * Question answered event (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/QuestionAnsweredEvent.as
 */
export class QuestionAnsweredEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestionAnsweredEventParser);
	}
}
