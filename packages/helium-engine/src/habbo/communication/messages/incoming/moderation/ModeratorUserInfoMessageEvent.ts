import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorUserInfoParser} from '../../parser/moderation/ModeratorUserInfoParser';

/**
 * Event for moderator user info data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorUserInfoEvent.as
 */
export class ModeratorUserInfoMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorUserInfoParser);
	}
}
