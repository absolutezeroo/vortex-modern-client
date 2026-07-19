import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomSettingsSavedEventParser} from '../../parser/roomsettings/RoomSettingsSavedEventParser';

export class RoomSettingsSavedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomSettingsSavedEventParser);
    }
}
