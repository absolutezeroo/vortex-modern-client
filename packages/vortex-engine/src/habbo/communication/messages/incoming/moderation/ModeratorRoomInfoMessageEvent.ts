import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorRoomInfoParser} from '../../parser/moderation/ModeratorRoomInfoParser';

/**
 * Event for moderator room info data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorRoomInfoEvent.as
 */
export class ModeratorRoomInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ModeratorRoomInfoParser);
    }
}
