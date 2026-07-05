import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestMessageEventParser} from '../../parser/quest/QuestMessageEventParser';

/**
 * Event for a single quest message from the server.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/quest/QuestMessageEvent.as
 */
export class QuestMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, QuestMessageEventParser);
    }
}
