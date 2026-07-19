import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/furni/FurniListEvent.as
 */
export class FurniListMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FurniListMessageParser);
    }
}
