import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    MarketplaceCancelAllOffersResultEventParser
} from '../../parser/marketplace/MarketplaceCancelAllOffersResultEventParser';

/**
 * TS-derived name: newer feature absent from win63_version/PRODUCTION-201601012205-226667486
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1899/_SafeCls_1965.as
 */
export class MarketplaceCancelAllOffersResultEvent extends MessageEvent implements IMessageEvent 
{
    constructor(callback: MessageEventCallback) 
    {
        super(callback, MarketplaceCancelAllOffersResultEventParser);
    }
}
