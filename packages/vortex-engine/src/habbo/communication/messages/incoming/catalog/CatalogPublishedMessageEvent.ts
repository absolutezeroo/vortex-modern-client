import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CatalogPublishedMessageEventParser} from '../../parser/catalog/CatalogPublishedMessageEventParser';

/**
 * The catalog was republished on the server, so anything cached about it is stale.
 *
 * Header 773, from WIN63's own registry (`habbo/communication/_SafeCls_2046.as:1732`, class
 * `_SafeCls_2322`) and corroborated by the emulator.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/CatalogPublishedMessageEvent.as
 */
export class CatalogPublishedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CatalogPublishedMessageEventParser);
    }
}
