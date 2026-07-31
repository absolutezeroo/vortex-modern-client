import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetBreedingEventParser} from '@habbo/communication/messages/parser/inventory/pets/PetBreedingEventParser';

/**
 * Progress of a breeding negotiation between two monster plants (header 939).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/PetBreedingEvent.as (obfuscated in the primary dump as _SafeStr_4546[939] = _SafeCls_2392, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_2392.as)
 */
export class PetBreedingEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PetBreedingEventParser);
    }
}
