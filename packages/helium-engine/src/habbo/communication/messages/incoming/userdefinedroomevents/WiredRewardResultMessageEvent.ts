import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredRewardResultMessageEventParser} from '../../parser/userdefinedroomevents/WiredRewardResultMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/userdefinedroomevents/WiredRewardResultMessageEvent.as
 */
export class WiredRewardResultMessageEvent extends MessageEvent implements IMessageEvent
{
    public static readonly REASON_ACHIEVEMENT: number = 6;
    public static readonly REASON_BADGE: number = 7;

    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredRewardResultMessageEventParser);
    }
}
