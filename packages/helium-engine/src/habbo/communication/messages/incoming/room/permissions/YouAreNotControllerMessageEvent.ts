/**
 * YouAreNotControllerMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.permissions.YouAreNotControllerMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	YouAreNotControllerMessageParser
} from '@habbo/communication/messages/parser/room/permissions/YouAreNotControllerMessageParser';

export class YouAreNotControllerMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, YouAreNotControllerMessageParser);
	}
}
