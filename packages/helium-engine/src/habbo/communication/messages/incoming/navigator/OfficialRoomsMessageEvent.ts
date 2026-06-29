import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {OfficialRoomsMessageParser} from '../../parser/navigator/OfficialRoomsMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/OfficialRoomsEvent.as
 */
export class OfficialRoomsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, OfficialRoomsMessageParser);
	}
}
