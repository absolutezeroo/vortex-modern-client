import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MessengerInitParser} from '../../parser/friendlist/MessengerInitParser';

/**
 * Event handler for messenger initialization.
 * Provides friend limits and category data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/MessengerInitEvent.as
 */
export class MessengerInitEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MessengerInitParser);
    }
}
