import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PromoArticlesMessageParser} from '../../parser/landingview/PromoArticlesMessageParser';

/**
 * Event for promo articles from the landing view.
 * @see source_nitro_renderer/.../incoming/landingview/PromoArticlesMessageEvent.ts
 */
export class PromoArticlesMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PromoArticlesMessageParser);
	}
}
