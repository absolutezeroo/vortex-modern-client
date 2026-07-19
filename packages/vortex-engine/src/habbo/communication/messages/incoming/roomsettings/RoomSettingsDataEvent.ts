import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomSettingsDataEventParser} from '../../parser/roomsettings/RoomSettingsDataEventParser';

export class RoomSettingsDataEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomSettingsDataEventParser);
    }
}
