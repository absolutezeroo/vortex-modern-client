import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInfoUpdatedMessageParser} from '../../parser/navigator/RoomInfoUpdatedMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/RoomInfoUpdatedEvent.as
 */
export class RoomInfoUpdatedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomInfoUpdatedMessageParser);
	}
}
