import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RentOrBuyoutOfferMessageParser} from '../../parser/rent/RentOrBuyoutOfferMessageParser';

/**
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2437/_SafeCls_2663.as
 * (incoming registry `_SafeStr_4546[1127]`)
 */
export class RentOrBuyoutOfferMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RentOrBuyoutOfferMessageParser);
    }
}
