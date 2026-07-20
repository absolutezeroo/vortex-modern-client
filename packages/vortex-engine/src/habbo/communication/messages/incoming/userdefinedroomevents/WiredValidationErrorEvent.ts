import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredValidationErrorParser} from '../../parser/userdefinedroomevents/WiredValidationErrorParser';

/**
 * Incoming wired save/validation failure (WIN63 header 3201). Consumed by
 * IncomingMessages.onValidationError, which alerts the localized message and calls
 * wiredCtrl.onSaveFailure().
 *
 * Name recovered from vortex-flash-client: WiredValidationErrorEvent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2398.as
 */
export class WiredValidationErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredValidationErrorParser);
    }
}
