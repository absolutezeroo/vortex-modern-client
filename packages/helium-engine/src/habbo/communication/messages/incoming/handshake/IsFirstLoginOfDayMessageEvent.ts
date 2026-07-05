import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IsFirstLoginOfDayMessageParser} from '../../parser/handshake/IsFirstLoginOfDayMessageParser';

/**
 * Event handler for IsFirstLoginOfDay message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/IsFirstLoginOfDayEvent.as
 */
export class IsFirstLoginOfDayMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IsFirstLoginOfDayMessageParser);
    }
}
