import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboGroupDeactivatedMessageParser} from '../../parser/users/HabboGroupDeactivatedMessageParser';

/**
 * HabboGroupDeactivatedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.HabboGroupDeactivatedMessageEvent
 */
export class HabboGroupDeactivatedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HabboGroupDeactivatedMessageParser);
	}

	get groupId(): number
	{
		return (this._parser as HabboGroupDeactivatedMessageParser).groupId;
	}
}
