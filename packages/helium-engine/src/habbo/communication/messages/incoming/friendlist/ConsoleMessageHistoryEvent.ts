import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConsoleMessageHistoryEventParser} from '../../parser/friendlist/ConsoleMessageHistoryEventParser';

/**
 * Event handler for console message history.
 * Fired when a conversation history fragment is received.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/ConsoleMessageHistoryEvent.as
 */
export class ConsoleMessageHistoryEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ConsoleMessageHistoryEventParser);
    }
}
