import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendRequestsMessageParser} from '../../parser/friendlist/FriendRequestsMessageParser';

/**
 * Event for receiving the list of pending friend requests.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendRequestsEvent.as
 */
export class FriendRequestsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FriendRequestsMessageParser);
    }
}
