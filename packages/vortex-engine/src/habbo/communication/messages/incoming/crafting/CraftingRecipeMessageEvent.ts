import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CraftingRecipeMessageEventParser
} from '@habbo/communication/messages/parser/crafting/CraftingRecipeMessageEventParser';

/**
 * A recipe's ingredient list, in response to `GetCraftingRecipeComposer` (1398).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2454/_SafeCls_2758.as
 * (real name from sources/win63_version/habbo/communication/messages/incoming/crafting/CraftingRecipeMessageEvent.as;
 * header 425 from WIN63's registry)
 */
export class CraftingRecipeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CraftingRecipeMessageEventParser);
    }
}
