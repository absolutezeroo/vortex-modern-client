import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboUserBadgesMessageParser} from '../../parser/users/HabboUserBadgesMessageParser';

/**
 * HabboUserBadgesMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.HabboUserBadgesMessageEvent
 */
export class HabboUserBadgesMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HabboUserBadgesMessageParser);
	}

	get userId(): number
	{
		return (this._parser as HabboUserBadgesMessageParser).userId;
	}

	get badges(): string[]
	{
		return (this._parser as HabboUserBadgesMessageParser).badges;
	}
}
