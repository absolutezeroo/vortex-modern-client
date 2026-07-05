import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideTicketResolutionMessageParser} from '../../parser/help/GuideTicketResolutionMessageParser';

/**
 * Event for guide ticket resolution.
 * Fired when a guide ticket has been resolved.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideTicketResolutionMessageEvent.as
 */
export class GuideTicketResolutionMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuideTicketResolutionMessageParser);
    }
}
