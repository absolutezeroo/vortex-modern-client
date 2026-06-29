import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	AchievementResolutionProgressMessageEventParser
} from '../../../parser/game/lobby/AchievementResolutionProgressMessageEventParser';

/**
 * Event for the achievement resolution progress message.
 * Contains progress data for a specific resolution achievement.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/game/lobby/AchievementResolutionProgressMessageEvent.as
 */
export class AchievementResolutionProgressMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementResolutionProgressMessageEventParser);
	}
}
