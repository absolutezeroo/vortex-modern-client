import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	FurniListInvalidateMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListInvalidateMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/furni/FurniListInvalidateEvent.as
 */
export class FurniListInvalidateMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListInvalidateMessageParser);
	}
}
