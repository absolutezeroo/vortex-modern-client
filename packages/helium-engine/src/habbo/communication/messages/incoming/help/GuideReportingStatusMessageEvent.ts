import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideReportingStatusMessageParser} from '../../parser/help/GuideReportingStatusMessageParser';

/**
 * Event for guide reporting status updates.
 * Contains the current status of the guide reporting system.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideReportingStatusMessageEvent.as
 */
export class GuideReportingStatusMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideReportingStatusMessageParser);
	}
}
