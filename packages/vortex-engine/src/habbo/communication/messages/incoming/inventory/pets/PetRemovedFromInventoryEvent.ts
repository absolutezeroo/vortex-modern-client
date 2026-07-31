import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetRemovedFromInventoryEventParser} from '@habbo/communication/messages/parser/inventory/pets/PetRemovedFromInventoryEventParser';

/**
 * A pet has left the inventory (header 3013).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/PetRemovedFromInventoryEvent.as (obfuscated in the primary dump as _SafeStr_4546[3013] = _SafeCls_2397, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_2397.as)
 */
export class PetRemovedFromInventoryEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetRemovedFromInventoryEventParser);
    }
}
