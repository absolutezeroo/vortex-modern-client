import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PurchaseOKMessageEventParser} from '../../parser/catalog/PurchaseOKMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PurchaseOKMessageEvent.as
 */
export class PurchaseOKMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PurchaseOKMessageEventParser);
    }
}
