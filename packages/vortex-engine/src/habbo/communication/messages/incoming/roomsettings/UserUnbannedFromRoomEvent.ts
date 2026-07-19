import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserUnbannedFromRoomEventParser} from '../../parser/roomsettings/UserUnbannedFromRoomEventParser';

export class UserUnbannedFromRoomEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, UserUnbannedFromRoomEventParser);
    }
}
