import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {HabboGroupDetailsData} from './HabboGroupDetailsData';
import {HabboGroupDetailsMessageParser} from '../../parser/users/HabboGroupDetailsMessageParser';

/**
 * HabboGroupDetailsMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.HabboGroupDetailsMessageEvent
 */
export class HabboGroupDetailsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboGroupDetailsMessageParser);
    }

    get data(): HabboGroupDetailsData | null
    {
        return (this._parser as HabboGroupDetailsMessageParser).data;
    }
}
