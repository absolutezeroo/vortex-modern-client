import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceCancelOfferResultEventParser} from '../../parser/marketplace/MarketplaceCancelOfferResultEventParser';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2045.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketplaceCancelOfferResultEvent.as)
 */
export class MarketplaceCancelOfferResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceCancelOfferResultEventParser);
    }
}
