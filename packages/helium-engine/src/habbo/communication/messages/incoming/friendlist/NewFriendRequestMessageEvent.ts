import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NewFriendRequestMessageParser} from '../../parser/friendlist/NewFriendRequestMessageParser';

/**
 * Event for receiving a new incoming friend request notification.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/NewFriendRequestEvent.as
 */
export class NewFriendRequestMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NewFriendRequestMessageParser);
	}
}
