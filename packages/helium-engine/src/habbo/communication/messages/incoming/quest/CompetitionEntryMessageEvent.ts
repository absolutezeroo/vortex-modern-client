import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompetitionEntryMessageParser} from '../../parser/quest/CompetitionEntryMessageParser';

/**
 * Event fired when competition entry prizes are received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/class_931.as
 */
export class CompetitionEntryMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: MessageEventCallback)
	{
		super(callBack, CompetitionEntryMessageParser);
	}
}
