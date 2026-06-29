import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementsEventParser} from '../../../parser/inventory/achievements/AchievementsEventParser';

/**
 * Event for receiving the full list of achievements.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/achievements/AchievementsEvent.as
 */
export class AchievementsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementsEventParser);
	}
}
