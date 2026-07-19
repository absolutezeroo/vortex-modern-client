import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    FurniListRemoveMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/furni/FurniListRemoveEvent.as
 */
export class FurniListRemoveMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FurniListRemoveMessageParser);
    }
}
