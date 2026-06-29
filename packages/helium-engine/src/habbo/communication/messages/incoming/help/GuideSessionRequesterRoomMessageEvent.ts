import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionRequesterRoomMessageParser} from '../../parser/help/GuideSessionRequesterRoomMessageParser';

/**
 * Event for guide session requester room information.
 * Contains the room ID where the help requester is located.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionRequesterRoomMessageEvent.as
 */
export class GuideSessionRequesterRoomMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionRequesterRoomMessageParser);
	}
}
