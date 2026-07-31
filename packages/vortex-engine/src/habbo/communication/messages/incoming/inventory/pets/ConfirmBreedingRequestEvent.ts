import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConfirmBreedingRequestEventParser} from '@habbo/communication/messages/parser/inventory/pets/ConfirmBreedingRequestEventParser';

/**
 * The server asks the nest owner to name the offspring and pick a rarity outcome (header 1477).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/ConfirmBreedingRequestEvent.as (obfuscated in the primary dump as _SafeStr_4546[1477] = _SafeCls_2909, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_2909.as)
 */
export class ConfirmBreedingRequestEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ConfirmBreedingRequestEventParser);
    }
}
