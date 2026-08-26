import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CraftingRecipesAvailableMessageEventParser
} from '@habbo/communication/messages/parser/crafting/CraftingRecipesAvailableMessageEventParser';

/**
 * Answers `GetCraftingRecipesAvailableComposer` (1302): how many secret recipes match the mixer's
 * current contents.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2454/_SafeCls_2944.as
 * (real name from sources/win63_version/habbo/communication/messages/incoming/crafting/CraftingRecipesAvailableMessageEvent.as;
 * header 3282 from WIN63's registry)
 */
export class CraftingRecipesAvailableMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CraftingRecipesAvailableMessageEventParser);
    }
}
