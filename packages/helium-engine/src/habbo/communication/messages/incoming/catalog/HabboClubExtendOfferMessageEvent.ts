import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboClubExtendOfferMessageEventParser} from '../../parser/catalog/HabboClubExtendOfferMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/HabboClubExtendOfferMessageEvent.as
 */
export class HabboClubExtendOfferMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboClubExtendOfferMessageEventParser);
    }
}
