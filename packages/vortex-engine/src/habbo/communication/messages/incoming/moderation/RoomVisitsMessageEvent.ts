import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomVisitsMessageParser} from '../../parser/moderation/RoomVisitsMessageParser';

/**
 * Event for room visits data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/RoomVisitsEvent.as
 */
export class RoomVisitsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomVisitsMessageParser);
    }
}
