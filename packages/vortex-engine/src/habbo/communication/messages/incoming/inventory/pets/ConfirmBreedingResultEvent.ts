import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConfirmBreedingResultEventParser} from '@habbo/communication/messages/parser/inventory/pets/ConfirmBreedingResultEventParser';

/**
 * Verdict on a confirmed breeding nest (header 2068).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/ConfirmBreedingResultEvent.as (obfuscated in the primary dump as _SafeStr_4546[2068] = _SafeCls_2894, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_2894.as)
 */
export class ConfirmBreedingResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ConfirmBreedingResultEventParser);
    }
}
