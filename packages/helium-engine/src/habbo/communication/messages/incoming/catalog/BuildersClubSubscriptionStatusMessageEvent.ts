import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	BuildersClubSubscriptionStatusMessageParser
} from '../../parser/catalog/BuildersClubSubscriptionStatusMessageParser';

/**
 * Event handler for BuildersClubSubscriptionStatus message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/catalog/BuildersClubSubscriptionStatusMessageEvent.as
 */
export class BuildersClubSubscriptionStatusMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BuildersClubSubscriptionStatusMessageParser);
	}
}
