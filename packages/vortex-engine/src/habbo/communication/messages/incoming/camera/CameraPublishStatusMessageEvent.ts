import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CameraPublishStatusMessageParser} from '@habbo/communication/messages/parser/camera/CameraPublishStatusMessageParser';

/**
 * The outcome of a publish-photo request.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/CameraPublishStatusMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3233` in the primary tree; header 203 from WIN63's registry)
 */
export class CameraPublishStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CameraPublishStatusMessageParser);
    }
}
