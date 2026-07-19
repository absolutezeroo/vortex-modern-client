import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomSettingsSaveErrorEventParser} from '../../parser/roomsettings/RoomSettingsSaveErrorEventParser';

export class RoomSettingsSaveErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomSettingsSaveErrorEventParser);
    }
}
