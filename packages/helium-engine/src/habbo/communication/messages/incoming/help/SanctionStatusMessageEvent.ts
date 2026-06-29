import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SanctionStatusMessageParser} from '../../parser/help/SanctionStatusMessageParser';

/**
 * Event for sanction status updates.
 * Provides information about the user's current sanction state.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/callforhelp/SanctionStatusEvent.as
 */
export class SanctionStatusMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SanctionStatusMessageParser);
	}
}
