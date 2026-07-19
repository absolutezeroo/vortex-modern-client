import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BannedUsersFromRoomEventParser} from '../../parser/roomsettings/BannedUsersFromRoomEventParser';

export class BannedUsersFromRoomEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BannedUsersFromRoomEventParser);
    }
}
