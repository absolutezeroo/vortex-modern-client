import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FaqTextMessageParser} from '../../parser/help/FaqTextMessageParser';

/**
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/help/FaqTextMessageEvent.as
 *      (name recovered via sources/PRODUCTION-201601012205-226667486/OriginalClassNames.txt; exact field match with
 *      sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1843/_SafeCls_3480.as)
 */
export class FaqTextMessageEvent extends MessageEvent implements IMessageEvent 
{
    constructor(callback: MessageEventCallback) 
    {
        super(callback, FaqTextMessageParser);
    }
}
