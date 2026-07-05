import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CallForHelpReplyMessageParser} from '../../parser/help/CallForHelpReplyMessageParser';

/**
 * Event for call for help reply messages from staff.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/CallForHelpReplyMessageEvent.as
 */
export class CallForHelpReplyMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CallForHelpReplyMessageParser);
    }
}
