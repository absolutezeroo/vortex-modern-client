import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ExtendedProfileChangedMessageParser} from '../../parser/users/ExtendedProfileChangedMessageParser';

/**
 * ExtendedProfileChangedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ExtendedProfileChangedMessageEvent
 */
export class ExtendedProfileChangedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ExtendedProfileChangedMessageParser);
	}

	get userId(): number
	{
		return (this._parser as ExtendedProfileChangedMessageParser).userId;
	}
}
