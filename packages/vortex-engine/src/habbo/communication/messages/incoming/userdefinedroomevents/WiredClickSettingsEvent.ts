import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredClickSettingsParser} from '../../parser/userdefinedroomevents/WiredClickSettingsParser';

/**
 * Incoming wired click-settings event (WIN63 header 3931). Consumed by
 * WiredEnvironment.onWiredClickSettingsEvent.
 *
 * Name derived (no counterpart in the older vortex-flash-client) — see WiredClickSettingsParser.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3436.as
 */
export class WiredClickSettingsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredClickSettingsParser);
    }
}
