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

    // AS3: sources/win63_version/habbo/communication/messages/incoming/users/HabboGroupJoinFailedMessageEvent.as::get reason()
    get reason(): number
    {
        return (this._parser as HabboGroupJoinFailedMessageParser).reason;
    }
}
