import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboClubOffersMessageEventParser} from '../../parser/catalog/HabboClubOffersMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/HabboClubOffersMessageEvent.as
 */
export class HabboClubOffersMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboClubOffersMessageEventParser);
    }
}
