import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NestBreedingSuccessEventParser} from '@habbo/communication/messages/parser/inventory/pets/NestBreedingSuccessEventParser';

/**
 * A breeding nest hatched (header 40).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/pets/NestBreedingSuccessEvent.as (obfuscated in the primary dump as _SafeStr_4546[40] = _SafeCls_3668, sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2393/_SafeCls_3668.as)
 */
export class NestBreedingSuccessEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NestBreedingSuccessEventParser);
    }
}
