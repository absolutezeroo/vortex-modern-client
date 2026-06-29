import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PopularRoomTagsResultMessageParser} from '../../parser/navigator/PopularRoomTagsResultMessageParser';

/**
 * Event handler for PopularRoomTagsResult message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/PopularRoomTagsResultEvent.as
 */
export class PopularRoomTagsResultMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PopularRoomTagsResultMessageParser);
	}
}
