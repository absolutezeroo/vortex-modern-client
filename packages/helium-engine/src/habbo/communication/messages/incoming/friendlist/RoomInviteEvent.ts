import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInviteEventParser} from '../../parser/friendlist/RoomInviteEventParser';

/**
 * Event handler for room invite events.
 * Fired when a friend sends a room invitation.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/RoomInviteEvent.as
 */
export class RoomInviteEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomInviteEventParser);
    }
}
