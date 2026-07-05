import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInviteErrorMessageParser} from '../../parser/friendlist/RoomInviteErrorMessageParser';

/**
 * Event for receiving room invite errors.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/RoomInviteErrorEvent.as
 */
export class RoomInviteErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomInviteErrorMessageParser);
    }
}
