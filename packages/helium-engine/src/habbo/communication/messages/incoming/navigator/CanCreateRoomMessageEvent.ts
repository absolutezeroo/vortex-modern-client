import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CanCreateRoomMessageParser} from '../../parser/navigator/CanCreateRoomMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/CanCreateRoomEvent.as
 */
export class CanCreateRoomMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CanCreateRoomMessageParser);
    }
}
