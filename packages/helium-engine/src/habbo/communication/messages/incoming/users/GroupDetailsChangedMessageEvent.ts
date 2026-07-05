import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GroupDetailsChangedMessageParser} from '../../parser/users/GroupDetailsChangedMessageParser';

/**
 * GroupDetailsChangedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.GroupDetailsChangedMessageEvent
 */
export class GroupDetailsChangedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GroupDetailsChangedMessageParser);
    }

    get groupId(): number
    {
        return (this._parser as GroupDetailsChangedMessageParser).groupId;
    }
}
