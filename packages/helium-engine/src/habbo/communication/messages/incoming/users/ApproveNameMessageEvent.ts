import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ApproveNameMessageParser} from '../../parser/users/ApproveNameMessageParser';

/**
 * ApproveNameMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.users.ApproveNameMessageEvent
 */
export class ApproveNameMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ApproveNameMessageParser);
	}
}
