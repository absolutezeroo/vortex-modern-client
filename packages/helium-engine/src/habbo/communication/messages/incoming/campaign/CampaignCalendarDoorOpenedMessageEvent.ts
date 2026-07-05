import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CampaignCalendarDoorOpenedMessageParser} from '../../parser/campaign/CampaignCalendarDoorOpenedMessageParser';

/**
 * Event for campaign calendar door opened response from server
 *
 * @see source_as_win63/habbo/communication/messages/incoming/campaign/CampaignCalendarDoorOpenedMessageEvent.as
 */
export class CampaignCalendarDoorOpenedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CampaignCalendarDoorOpenedMessageParser);
    }
}
