import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/pets/PetInventoryEvent.as
 */
export class PetInventoryMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetInventoryMessageParser);
	}
}
