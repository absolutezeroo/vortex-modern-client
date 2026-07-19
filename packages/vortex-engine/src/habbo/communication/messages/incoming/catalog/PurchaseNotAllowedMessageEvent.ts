import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PurchaseNotAllowedMessageEventParser} from '../../parser/catalog/PurchaseNotAllowedMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PurchaseNotAllowedMessageEvent.as
 */
export class PurchaseNotAllowedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PurchaseNotAllowedMessageEventParser);
    }
}
