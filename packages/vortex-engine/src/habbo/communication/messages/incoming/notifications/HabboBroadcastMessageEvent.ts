import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboBroadcastMessageEventParser} from '../../parser/notifications/HabboBroadcastMessageEventParser';

/**
 * Event for Habbo broadcast message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/HabboBroadcastMessageEvent.as
 */
export class HabboBroadcastMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboBroadcastMessageEventParser);
    }
}
