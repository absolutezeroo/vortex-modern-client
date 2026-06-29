import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionAttachedMessageParser} from '../../parser/help/GuideSessionAttachedMessageParser';

/**
 * Event for guide session attachment notification.
 * Fired when the user is attached to a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/GuideSessionAttachedMessageEvent.as
 */
export class GuideSessionAttachedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionAttachedMessageParser);
	}
}
