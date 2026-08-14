import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CameraPurchaseOKMessageParser} from '@habbo/communication/messages/parser/camera/CameraPurchaseOKMessageParser';

/**
 * The photo purchase went through.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/camera/CameraPurchaseOKMessageEvent.as
 * (`_SafePkg_3032/_SafeCls_3371` in the primary tree; header 3907 from WIN63's registry)
 */
export class CameraPurchaseOKMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CameraPurchaseOKMessageParser);
    }
}
