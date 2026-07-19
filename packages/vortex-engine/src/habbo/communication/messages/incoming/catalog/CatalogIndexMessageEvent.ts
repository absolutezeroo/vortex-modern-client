import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CatalogIndexMessageEventParser} from '../../parser/catalog/CatalogIndexMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/CatalogIndexMessageEvent.as
 */
export class CatalogIndexMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CatalogIndexMessageEventParser);
    }
}
