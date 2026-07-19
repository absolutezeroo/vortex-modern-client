import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RestoreClientMessageEventParser} from '../../parser/notifications/RestoreClientMessageEventParser';

/**
 * Event for restore client message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/RestoreClientMessageEvent.as
 */
export class RestoreClientMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RestoreClientMessageEventParser);
    }
}
