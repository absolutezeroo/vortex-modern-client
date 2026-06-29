import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MysteryBoxKeysMessageParser} from '../../parser/mysterybox/MysteryBoxKeysMessageParser';

/**
 * Event handler for MysteryBoxKeys message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/mysterybox/MysteryBoxKeysMessageEvent.as
 */
export class MysteryBoxKeysMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MysteryBoxKeysMessageParser);
	}
}
