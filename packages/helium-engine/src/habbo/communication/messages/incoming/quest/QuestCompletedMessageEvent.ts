import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestCompletedMessageEventParser} from '../../parser/quest/QuestCompletedMessageEventParser';

/**
 * Event for the quest completed message from the server.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/quest/QuestCompletedMessageEvent.as
 */
export class QuestCompletedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestCompletedMessageEventParser);
	}
}
