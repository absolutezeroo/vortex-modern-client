import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredSaveSuccessMessageParser} from '../../parser/userdefinedroomevents/WiredSaveSuccessMessageParser';

/**
 * Incoming "wired saved successfully" push (WIN63 header 1192). Consumed by
 * IncomingMessages.onSaveSuccess -> wiredCtrl.onSaveSuccess().
 *
 * Name recovered from vortex-flash-client: WiredSaveSuccessEvent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2958.as
 */
export class WiredSaveSuccessEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredSaveSuccessMessageParser);
    }
}
