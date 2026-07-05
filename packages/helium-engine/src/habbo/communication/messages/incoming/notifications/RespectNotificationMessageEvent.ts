import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RespectNotificationMessageEventParser} from '../../parser/notifications/RespectNotificationMessageEventParser';

/**
 * Event for respect notification message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/users/RespectNotificationMessageEvent.as
 */
export class RespectNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RespectNotificationMessageEventParser);
    }
}
