import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GoToBreedingNestFailureEventParser} from '@habbo/communication/messages/parser/inventory/pets/GoToBreedingNestFailureEventParser';

/**
 * A monster plant could not walk to its breeding nest (header 2441).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/GoToBreedingNestFailureEvent.as (obfuscated in the primary dump as _SafeStr_4546[2441] = _SafeCls_3355, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_3355.as)
 */
export class GoToBreedingNestFailureEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GoToBreedingNestFailureEventParser);
    }
}
