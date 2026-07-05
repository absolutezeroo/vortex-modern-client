import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PollOfferEventParser} from '../../parser/poll/PollOfferEventParser';

/**
 * Poll offer event
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/PollOfferEvent.as
 */
export class PollOfferEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PollOfferEventParser);
    }
}
