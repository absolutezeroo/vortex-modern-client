import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {ExtendedProfileData} from './ExtendedProfileData';
import {ExtendedProfileMessageParser} from '../../parser/users/ExtendedProfileMessageParser';

/**
 * ExtendedProfileMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ExtendedProfileMessageEvent
 */
export class ExtendedProfileMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ExtendedProfileMessageParser);
	}

	get data(): ExtendedProfileData | null
	{
		return (this._parser as ExtendedProfileMessageParser).data;
	}
}
