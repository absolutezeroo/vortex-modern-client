import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {PerkAllowancesMessageEventParser} from '../../parser/perk/PerkAllowancesMessageEventParser';

/**
 * Event for perk allowance data.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/perk/PerkAllowancesMessageEvent.as
 */
export class PerkAllowancesMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PerkAllowancesMessageEventParser);
	}

	override getParser<T extends IMessageParser = PerkAllowancesMessageEventParser>(): T
	{
		return this._parser as T;
	}
}
