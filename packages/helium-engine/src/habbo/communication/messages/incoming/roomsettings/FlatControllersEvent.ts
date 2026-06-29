import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatControllersEventParser} from '../../parser/roomsettings/FlatControllersEventParser';

export class FlatControllersEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FlatControllersEventParser);
    }
}
