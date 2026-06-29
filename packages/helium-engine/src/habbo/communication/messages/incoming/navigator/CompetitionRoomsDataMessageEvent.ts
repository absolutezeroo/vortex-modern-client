import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompetitionRoomsDataMessageParser} from '../../parser/navigator/CompetitionRoomsDataMessageParser';

/**
 * Event handler for CompetitionRoomsData message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/CompetitionRoomsDataMessageEvent.as
 */
export class CompetitionRoomsDataMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CompetitionRoomsDataMessageParser);
	}
}
