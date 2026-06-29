import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {ScrKickbackData} from './ScrKickbackData';
import {ScrSendKickbackInfoMessageParser} from '../../parser/users/ScrSendKickbackInfoMessageParser';

/**
 * ScrSendKickbackInfoMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ScrSendKickbackInfoMessageEvent
 */
export class ScrSendKickbackInfoMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ScrSendKickbackInfoMessageParser);
	}

	get data(): ScrKickbackData | null
	{
		return (this._parser as ScrSendKickbackInfoMessageParser).data;
	}
}
