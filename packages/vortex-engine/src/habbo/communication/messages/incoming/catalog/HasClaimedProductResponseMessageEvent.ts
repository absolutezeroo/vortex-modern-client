import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    HasClaimedProductResponseMessageParser
} from '@habbo/communication/messages/parser/catalog/HasClaimedProductResponseMessageParser';

/**
 * The answer to `HasClaimedProductComposer` — header 787 in WIN63's registry.
 *
 * **Name DERIVED** — see {@link HasClaimedProductResponseMessageParser}.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2973/_SafeCls_2972.as
 */
export class HasClaimedProductResponseMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HasClaimedProductResponseMessageParser);
    }
}
