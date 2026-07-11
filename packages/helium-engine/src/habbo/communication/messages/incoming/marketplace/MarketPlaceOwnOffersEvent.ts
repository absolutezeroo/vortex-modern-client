import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketPlaceOwnOffersEventParser} from '../../parser/marketplace/MarketPlaceOwnOffersEventParser';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2156.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketPlaceOwnOffersEvent.as)
 */
export class MarketPlaceOwnOffersEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketPlaceOwnOffersEventParser);
    }
}
