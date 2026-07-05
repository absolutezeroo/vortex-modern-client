import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RoomMessageNotificationMessageEventParser
} from '../../parser/notifications/RoomMessageNotificationMessageEventParser';

/**
 * Event for room message notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/room/furniture/RoomMessageNotificationMessageEvent.as
 */
export class RoomMessageNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomMessageNotificationMessageEventParser);
    }
}
