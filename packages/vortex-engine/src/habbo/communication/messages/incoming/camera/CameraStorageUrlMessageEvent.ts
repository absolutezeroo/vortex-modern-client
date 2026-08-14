import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CameraStorageUrlMessageParser} from '@habbo/communication/messages/parser/camera/CameraStorageUrlMessageParser';

/**
 * The base URL the rendered photo can be fetched from.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/CameraStorageUrlMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3707` in the primary tree; header 2176 from WIN63's registry)
 */
export class CameraStorageUrlMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CameraStorageUrlMessageParser);
    }
}
