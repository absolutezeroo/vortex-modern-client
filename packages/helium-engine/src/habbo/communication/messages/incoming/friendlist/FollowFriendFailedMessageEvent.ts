import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FollowFriendFailedMessageParser} from '../../parser/friendlist/FollowFriendFailedMessageParser';

/**
 * Event for receiving follow friend failure notifications.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FollowFriendFailedEvent.as
 */
export class FollowFriendFailedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FollowFriendFailedMessageParser);
	}
}
