import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredEnvironmentParser} from '../../parser/userdefinedroomevents/WiredEnvironmentParser';

/**
 * Incoming room-wide "wired environment" event (WIN63 header 2827). Consumed by
 * WiredEnvironment.onWiredEnvironmentEvent to update hasClickUserWired + achievement list.
 *
 * Name derived (no counterpart in the older vortex-flash-client) — see WiredEnvironmentParser.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3319.as
 */
export class WiredEnvironmentEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredEnvironmentParser);
    }
}
