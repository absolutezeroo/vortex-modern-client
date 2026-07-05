import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuestRoomSearchResultMessageParser} from '../../parser/navigator/GuestRoomSearchResultMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/GuestRoomSearchResultEvent.as
 */
export class GuestRoomSearchResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GuestRoomSearchResultMessageParser);
    }
}
