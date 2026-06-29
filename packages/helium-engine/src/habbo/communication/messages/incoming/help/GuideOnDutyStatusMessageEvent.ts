import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideOnDutyStatusMessageParser} from '../../parser/help/GuideOnDutyStatusMessageParser';

/**
 * Event for guide on-duty status updates.
 * Contains duty status and active guide/guardian counts.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideOnDutyStatusMessageEvent.as
 */
export class GuideOnDutyStatusMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideOnDutyStatusMessageParser);
	}
}
