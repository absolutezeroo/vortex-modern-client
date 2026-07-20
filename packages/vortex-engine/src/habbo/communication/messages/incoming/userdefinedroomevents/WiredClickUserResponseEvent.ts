import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredClickUserResponseEventParser} from '../../parser/userdefinedroomevents/WiredClickUserResponseEventParser';

/**
 * Incoming "click user" wired acknowledgement (WIN63 header 309). Consumed by
 * WiredEnvironment.onWiredClickUserResponseEvent, which re-dispatches a WiredUserClickHandledEvent.
 *
 * Name recovered from vortex-flash-client (older revision):
 * incoming/userdefinedroomevents/wiredmenu/WiredClickUserResponseEvent.as. WIN63 registers it
 * directly under userdefinedroomevents (`_SafeStr_4546[309] = _SafeCls_3728`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3728.as
 */
export class WiredClickUserResponseEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredClickUserResponseEventParser);
    }
}
