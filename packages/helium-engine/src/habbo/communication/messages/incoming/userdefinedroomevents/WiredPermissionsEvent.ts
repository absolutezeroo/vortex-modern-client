import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredPermissionsEventParser} from '../../parser/userdefinedroomevents/WiredPermissionsEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredPermissionsEvent.as
 */
export class WiredPermissionsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredPermissionsEventParser);
    }
}
