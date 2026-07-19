import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatAccessDeniedMessageParser} from '../../parser/navigator/FlatAccessDeniedMessageParser';

/**
 * Event handler for FlatAccessDenied message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/FlatAccessDeniedMessageEvent.as
 */
export class FlatAccessDeniedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FlatAccessDeniedMessageParser);
    }
}
