import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	FurniListRemoveMultipleMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMultipleMessageParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/inventory/furni/FurniListRemoveMultipleEvent.as
 */
export class FurniListRemoveMultipleMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListRemoveMultipleMessageParser);
	}
}
