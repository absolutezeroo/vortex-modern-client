import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MarketplaceConfigurationEventParser} from '../../parser/marketplace/MarketplaceConfigurationEventParser';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1899/_SafeCls_1967.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/incoming/marketplace/MarketplaceConfigurationEvent.as)
 */
export class MarketplaceConfigurationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MarketplaceConfigurationEventParser);
    }
}
