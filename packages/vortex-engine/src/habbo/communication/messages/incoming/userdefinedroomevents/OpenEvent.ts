import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {OpenMessageParser} from '../../parser/userdefinedroomevents/OpenMessageParser';

/**
 * Incoming "open wired config" push (WIN63 header 2635). Consumed by IncomingMessages.onOpen, which
 * replies with an OpenMessageComposer for the requested stuff id.
 *
 * Name recovered from vortex-flash-client: OpenEvent.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2464.as
 */
export class OpenEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, OpenMessageParser);
    }
}
