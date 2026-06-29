import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendNotificationMessageParser} from '../../parser/friendlist/FriendNotificationMessageParser';

/**
 * Event for receiving friend notifications (e.g. friend logged in/out).
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendNotificationEvent.as
 */
export class FriendNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FriendNotificationMessageParser);
	}
}
