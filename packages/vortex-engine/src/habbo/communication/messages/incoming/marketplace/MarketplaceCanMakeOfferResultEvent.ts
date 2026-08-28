import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceCanMakeOfferResultParser} from '../../parser/marketplace/MarketplaceCanMakeOfferResultParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketplaceCanMakeOfferResult.as
 */
export class MarketplaceCanMakeOfferResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceCanMakeOfferResultParser);
    }
}
