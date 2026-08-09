import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CatalogPublishedMessageEventParser} from '../../parser/catalog/CatalogPublishedMessageEventParser';

/**
 * The catalog was republished on the server, so anything cached about it is stale.
 *
 * Header 773, from WIN63's own registry (`habbo/communication/_SafeCls_2046.as:1732`, class
 * `_SafeCls_2322`) and corroborated by the emulator.
 *
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
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
