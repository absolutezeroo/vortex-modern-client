import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceBuyOfferResultEventParser} from '../../parser/marketplace/MarketplaceBuyOfferResultEventParser';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2211.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketplaceBuyOfferResultEvent.as)
 */
export class MarketplaceBuyOfferResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceBuyOfferResultEventParser);
    }
}
