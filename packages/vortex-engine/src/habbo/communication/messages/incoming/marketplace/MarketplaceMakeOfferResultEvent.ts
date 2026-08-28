import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceMakeOfferResultParser} from '../../parser/marketplace/MarketplaceMakeOfferResultParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketplaceMakeOfferResult.as
 */
export class MarketplaceMakeOfferResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceMakeOfferResultParser);
    }
}
