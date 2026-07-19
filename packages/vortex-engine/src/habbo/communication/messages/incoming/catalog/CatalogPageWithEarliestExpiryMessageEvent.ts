import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CatalogPageWithEarliestExpiryMessageEventParser} from '../../parser/catalog/CatalogPageWithEarliestExpiryMessageEventParser';

/**
 * Fired with the soonest-expiring catalog page's data.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/CatalogPageWithEarliestExpiryMessageEvent.as
 */
export class CatalogPageWithEarliestExpiryMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CatalogPageWithEarliestExpiryMessageEventParser);
    }
}
