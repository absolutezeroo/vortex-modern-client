import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FaqTextMessageParser} from '../../parser/help/FaqTextMessageParser';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1843/_SafeCls_3480.as
 *
 * The name is RECOVERED, but not from a file: `PRODUCTION-201601012205-226667486` has no
 * `help/FaqTextMessageEvent.as` — it is `OriginalClassNames.txt` in that tree's root that carries
 * the mapping, and the fields of `_SafeCls_3480` match it exactly.
 */
export class FaqTextMessageEvent extends MessageEvent implements IMessageEvent 
{
    constructor(callback: MessageEventCallback) 
    {
        super(callback, FaqTextMessageParser);
    }
}
