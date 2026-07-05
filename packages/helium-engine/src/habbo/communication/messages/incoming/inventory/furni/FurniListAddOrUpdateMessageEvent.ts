import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    FurniListAddOrUpdateMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListAddOrUpdateMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/furni/FurniListAddOrUpdateEvent.as
 */
export class FurniListAddOrUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FurniListAddOrUpdateMessageParser);
    }
}
