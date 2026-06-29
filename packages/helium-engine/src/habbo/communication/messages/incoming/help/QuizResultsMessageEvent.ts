import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuizResultsMessageParser} from '../../parser/help/QuizResultsMessageParser';

/**
 * Event fired when quiz results are received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/QuizResultsMessageEvent.as
 */
export class QuizResultsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, QuizResultsMessageParser);
	}
}
