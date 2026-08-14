import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InitCameraMessageParser} from '@habbo/communication/messages/parser/camera/InitCameraMessageParser';

/**
 * The camera's prices, in response to RequestCameraConfiguration (3010).
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/InitCameraMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3605` in the primary tree; header 2768 from WIN63's registry)
 */
export class InitCameraMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, InitCameraMessageParser);
    }
}
