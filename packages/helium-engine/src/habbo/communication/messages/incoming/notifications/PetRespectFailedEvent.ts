import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetRespectFailedEventParser} from '../../parser/notifications/PetRespectFailedEventParser';

/**
 * Event for pet respect failed
 *
 * @see source_as_win63/habbo/communication/messages/incoming/room/pets/PetRespectFailedEvent.as
 */
export class PetRespectFailedEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetRespectFailedEventParser);
	}
}
