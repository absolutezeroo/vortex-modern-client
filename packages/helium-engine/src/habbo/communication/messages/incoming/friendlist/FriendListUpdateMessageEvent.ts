import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendListUpdateMessageParser} from '../../parser/friendlist/FriendListUpdateMessageParser';

/**
 * Event for receiving friend list updates.
 * Contains categories, removed friend IDs, added friends, and updated friends.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendListUpdateEvent.as
 */
export class FriendListUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FriendListUpdateMessageParser);
    }
}
