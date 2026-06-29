/**
 * RoomEntryInfoMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.RoomEntryInfoMessageEvent
 *
 * Sent when entering a room with basic room info (ID and owner status).
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEntryInfoMessageParser} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';

export class RoomEntryInfoMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomEntryInfoMessageParser);
	}
}
