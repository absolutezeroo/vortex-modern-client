import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ThumbnailStatusMessageParser} from '@habbo/communication/messages/parser/camera/ThumbnailStatusMessageParser';

/**
 * The outcome of a room-thumbnail render.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/ThumbnailStatusMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3031` in the primary tree; header 1325 from WIN63's registry)
 */
export class ThumbnailStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ThumbnailStatusMessageParser);
    }
}
