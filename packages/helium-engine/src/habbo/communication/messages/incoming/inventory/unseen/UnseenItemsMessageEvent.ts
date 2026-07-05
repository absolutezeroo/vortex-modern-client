import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UnseenItemsMessageParser} from '@habbo/communication/messages/parser/inventory/unseen/UnseenItemsMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/unseen/UnseenItemsEvent.as
 */
export class UnseenItemsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, UnseenItemsMessageParser);
    }
}
