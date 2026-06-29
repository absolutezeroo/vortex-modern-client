import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionErrorMessageParser} from '../../parser/help/GuideSessionErrorMessageParser';

/**
 * Event fired when a guide session error occurs.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/GuideSessionErrorMessageEvent.as
 */
export class GuideSessionErrorMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, GuideSessionErrorMessageParser);
	}
}
