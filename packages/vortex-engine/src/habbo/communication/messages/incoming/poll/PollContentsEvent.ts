import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PollContentsEventParser} from '../../parser/poll/PollContentsEventParser';

/**
 * Poll contents event
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/PollContentsEvent.as
 */
export class PollContentsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PollContentsEventParser);
    }
}
