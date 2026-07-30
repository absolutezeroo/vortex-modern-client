import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetAddedToInventoryEventParser} from '@habbo/communication/messages/parser/inventory/pets/PetAddedToInventoryEventParser';

/**
 * A single pet has entered the inventory (header 3653).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/PetAddedToInventoryEvent.as (obfuscated in the primary dump as _SafeStr_4546[3653] = _SafeCls_3510, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_3510.as)
 */
export class PetAddedToInventoryEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetAddedToInventoryEventParser);
    }
}
