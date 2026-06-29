import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AcceptFriendResultMessageParser} from '../../parser/friendlist/AcceptFriendResultMessageParser';

/**
 * Event for receiving the result of accepting a friend request.
 * Contains a list of failures (if any requests could not be accepted).
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/AcceptFriendResultEvent.as
 */
export class AcceptFriendResultMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AcceptFriendResultMessageParser);
	}
}
