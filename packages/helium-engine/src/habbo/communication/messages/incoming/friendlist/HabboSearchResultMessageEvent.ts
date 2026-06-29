import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboSearchResultMessageParser} from '../../parser/friendlist/HabboSearchResultMessageParser';

/**
 * Event for receiving Habbo user search results.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/HabboSearchResultEvent.as
 */
export class HabboSearchResultMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HabboSearchResultMessageParser);
	}
}
