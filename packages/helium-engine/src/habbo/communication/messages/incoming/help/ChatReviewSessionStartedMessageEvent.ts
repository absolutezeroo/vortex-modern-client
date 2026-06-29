import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChatReviewSessionStartedMessageParser} from '../../parser/help/ChatReviewSessionStartedMessageParser';

/**
 * Event fired when a chat review session is started.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionStartedMessageEvent.as
 */
export class ChatReviewSessionStartedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, ChatReviewSessionStartedMessageParser);
	}
}
