import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuizDataMessageParser} from '../../parser/help/QuizDataMessageParser';

/**
 * Event fired when quiz data is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/QuizDataMessageEvent.as
 */
export class QuizDataMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, QuizDataMessageParser);
	}
}
