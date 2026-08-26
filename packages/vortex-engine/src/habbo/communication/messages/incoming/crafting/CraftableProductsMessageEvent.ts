import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CraftableProductsMessageEventParser
} from '@habbo/communication/messages/parser/crafting/CraftableProductsMessageEventParser';

/**
 * The craftable-products list, in response to `GetCraftableProductsComposer` (369).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2454/_SafeCls_2453.as
 * (real name from sources/win63_version/habbo/communication/messages/incoming/crafting/CraftableProductsMessageEvent.as;
 * header 3155 from WIN63's registry)
 */
export class CraftableProductsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CraftableProductsMessageEventParser);
    }
}
