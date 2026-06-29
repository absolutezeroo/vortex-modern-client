/**
 * OpenPetPackageResultMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.furniture.OpenPetPackageResultMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	OpenPetPackageResultMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/OpenPetPackageResultMessageEventParser';

export class OpenPetPackageResultMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, OpenPetPackageResultMessageEventParser);
	}
}
