import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FindFriendsProcessResultMessageParser} from '../../parser/friendlist/FindFriendsProcessResultMessageParser';

/**
 * Event for receiving the result of a find new friends request.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FindFriendsProcessResultEvent.as
 */
export class FindFriendsProcessResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, FindFriendsProcessResultMessageParser);
    }
}
