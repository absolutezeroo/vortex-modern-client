/**
 * FurnitureAliasesMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.FurnitureAliasesMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	FurnitureAliasesMessageParser
} from '@habbo/communication/messages/parser/room/engine/FurnitureAliasesMessageParser';

export class FurnitureAliasesMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurnitureAliasesMessageParser);
	}
}
