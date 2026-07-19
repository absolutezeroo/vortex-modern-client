import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatControllerAddedEventParser} from '../../parser/roomsettings/FlatControllerAddedEventParser';

export class FlatControllerAddedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FlatControllerAddedEventParser);
    }
}
