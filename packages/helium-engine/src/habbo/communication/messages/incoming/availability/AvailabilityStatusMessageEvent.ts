import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvailabilityStatusMessageParser} from '../../parser/availability/AvailabilityStatusMessageParser';

/**
 * Event handler for availability status message
 * Indicates if the hotel is open, shutting down, etc.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/availability/AvailabilityStatusMessageEvent.as
 */
export class AvailabilityStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AvailabilityStatusMessageParser);
    }
}
