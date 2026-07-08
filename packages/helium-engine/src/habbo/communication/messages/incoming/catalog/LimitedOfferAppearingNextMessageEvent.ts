import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {LimitedOfferAppearingNextMessageEventParser} from '../../parser/catalog/LimitedOfferAppearingNextMessageEventParser';

/**
 * Fired with the next limited-edition rare's appearance countdown data.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/LimitedOfferAppearingNextMessageEvent.as
 */
export class LimitedOfferAppearingNextMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, LimitedOfferAppearingNextMessageEventParser);
    }
}
