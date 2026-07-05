import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConcurrentUsersGoalProgressMessageParser} from '../../parser/quest/ConcurrentUsersGoalProgressMessageParser';

/**
 * Event fired when concurrent users goal progress is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/ConcurrentUsersGoalProgressMessageEvent.as
 */
export class ConcurrentUsersGoalProgressMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: MessageEventCallback)
    {
        super(callBack, ConcurrentUsersGoalProgressMessageParser);
    }
}
