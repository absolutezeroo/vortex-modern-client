import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatControllerRemovedEventParser} from '../../parser/roomsettings/FlatControllerRemovedEventParser';

export class FlatControllerRemovedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FlatControllerRemovedEventParser);
    }
}
