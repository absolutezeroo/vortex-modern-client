import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ClubGiftInfoEventParser} from '../../parser/catalog/ClubGiftInfoEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/ClubGiftInfoEvent.as
 */
export class ClubGiftInfoEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ClubGiftInfoEventParser);
	}
}
