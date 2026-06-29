import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestDailyMessageParser} from '../../parser/quest/QuestDailyMessageParser';

/**
 * Event fired when daily quest data is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/QuestDailyMessageEvent.as
 */
export class QuestDailyMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, QuestDailyMessageParser);
	}
}
