import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionPartnerIsTypingMessageParser} from '../../parser/help/GuideSessionPartnerIsTypingMessageParser';

/**
 * Event fired when a guide session partner is typing.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/GuideSessionPartnerIsTypingMessageEvent.as
 */
export class GuideSessionPartnerIsTypingMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, GuideSessionPartnerIsTypingMessageParser);
	}
}
