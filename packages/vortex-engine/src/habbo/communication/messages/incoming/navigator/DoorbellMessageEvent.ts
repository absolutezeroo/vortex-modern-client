import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DoorbellMessageParser} from '../../parser/navigator/DoorbellMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/DoorbellEvent.as
 */
export class DoorbellMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, DoorbellMessageParser);
    }
}
