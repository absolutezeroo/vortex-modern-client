import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestionEventParser} from '../../parser/poll/QuestionEventParser';

/**
 * Question event (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/QuestionEvent.as
 */
export class QuestionEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, QuestionEventParser);
    }
}
