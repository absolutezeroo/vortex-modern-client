import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IgnoredUsersMessageParser} from '../../parser/users/IgnoredUsersMessageParser';

/**
 * Event for ignored users list.
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.IgnoredUsersMessageEvent
 */
export class IgnoredUsersMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, IgnoredUsersMessageParser);
    }

    get ignoredUserIds(): number[]
    {
        return (this._parser as IgnoredUsersMessageParser).ignoredUsers;
    }
}
