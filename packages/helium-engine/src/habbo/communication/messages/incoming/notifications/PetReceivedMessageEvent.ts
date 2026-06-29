import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetReceivedMessageEventParser} from '../../parser/notifications/PetReceivedMessageEventParser';

/**
 * Event for pet received message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/pets/PetReceivedMessageEvent.as
 */
export class PetReceivedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetReceivedMessageEventParser);
	}
}
