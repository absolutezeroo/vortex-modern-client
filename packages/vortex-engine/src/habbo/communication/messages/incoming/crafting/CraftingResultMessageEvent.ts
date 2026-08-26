import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    CraftingResultMessageEventParser
} from '@habbo/communication/messages/parser/crafting/CraftingResultMessageEventParser';

/**
 * The result of a craft attempt, in response to `CraftComposer` (3274) or `CraftSecretComposer` (323).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2454/_SafeCls_2803.as
 * (real name from sources/win63_version/habbo/communication/messages/incoming/crafting/CraftingResultMessageEvent.as;
 * header 2999 from WIN63's registry)
 */
export class CraftingResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CraftingResultMessageEventParser);
    }
}
