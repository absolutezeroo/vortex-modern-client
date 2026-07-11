import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketPlaceOffersEventParser} from '../../parser/marketplace/MarketPlaceOffersEventParser';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_1898.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketPlaceOffersEvent.as)
 */
export class MarketPlaceOffersEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketPlaceOffersEventParser);
    }
}
