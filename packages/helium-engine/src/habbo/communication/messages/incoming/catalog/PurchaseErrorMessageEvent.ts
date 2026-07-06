import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PurchaseErrorMessageEventParser} from '../../parser/catalog/PurchaseErrorMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PurchaseErrorMessageEvent.as
 */
export class PurchaseErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PurchaseErrorMessageEventParser);
    }
}
