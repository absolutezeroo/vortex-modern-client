import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CommunityGoalHallOfFameMessageParser} from '../../parser/quest/CommunityGoalHallOfFameMessageParser';

/**
 * Event for the community goal hall of fame.
 * @see source_nitro_renderer/.../incoming/quest/CommunityGoalHallOfFameMessageEvent.ts
 */
export class CommunityGoalHallOfFameMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CommunityGoalHallOfFameMessageParser);
	}
}
