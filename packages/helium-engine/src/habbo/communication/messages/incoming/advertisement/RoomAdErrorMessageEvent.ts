import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomAdErrorMessageParser} from '../../parser/advertisement/RoomAdErrorMessageParser';

/**
 * Fired when the server rejects a room event (ad) name or description.
 * errorCode 0 = name error, errorCode 1 = description error.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/advertisement/RoomAdErrorEvent.as
 */
export class RoomAdErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomAdErrorMessageParser);
    }
}
