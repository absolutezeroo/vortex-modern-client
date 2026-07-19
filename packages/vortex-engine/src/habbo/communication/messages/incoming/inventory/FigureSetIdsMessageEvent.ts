import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FigureSetIdsMessageParser} from '../../parser/inventory/FigureSetIdsMessageParser';

/**
 * Event handler for FigureSetIds message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/clothing/FigureSetIdsEvent.as
 */
export class FigureSetIdsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FigureSetIdsMessageParser);
    }
}
