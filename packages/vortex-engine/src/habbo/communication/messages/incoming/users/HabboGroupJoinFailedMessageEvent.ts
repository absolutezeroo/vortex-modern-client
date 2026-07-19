import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboGroupJoinFailedMessageParser} from '../../parser/users/HabboGroupJoinFailedMessageParser';

/**
 * HabboGroupJoinFailedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.HabboGroupJoinFailedMessageEvent
 */
export class HabboGroupJoinFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboGroupJoinFailedMessageParser);
    }

    get reason(): number
    {
        return (this._parser as HabboGroupJoinFailedMessageParser).reason;
    }
}
