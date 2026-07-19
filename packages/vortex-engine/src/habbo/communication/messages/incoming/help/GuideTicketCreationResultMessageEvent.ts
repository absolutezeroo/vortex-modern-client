import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideTicketCreationResultMessageParser} from '../../parser/help/GuideTicketCreationResultMessageParser';

/**
 * Event for guide ticket creation result.
 * Fired after attempting to create a guide ticket.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideTicketCreationResultMessageEvent.as
 */
export class GuideTicketCreationResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideTicketCreationResultMessageParser);
    }
}
