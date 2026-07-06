import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CatalogPageMessageEventParser} from '../../parser/catalog/CatalogPageMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/CatalogPageMessageEvent.as
 */
export class CatalogPageMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CatalogPageMessageEventParser);
    }
}
