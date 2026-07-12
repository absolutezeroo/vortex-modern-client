import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RoomPropertyMessageEventParser
} from '@habbo/communication/messages/parser/room/engine/RoomPropertyMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/room/engine/RoomPropertyMessageEvent.as
 */
export class RoomPropertyMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomPropertyMessageEventParser);
    }
}
