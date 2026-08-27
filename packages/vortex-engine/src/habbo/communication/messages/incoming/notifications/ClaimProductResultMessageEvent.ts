import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    ClaimProductResultMessageParser
} from '@habbo/communication/messages/parser/notifications/ClaimProductResultMessageParser';

/**
 * The outcome of claiming a product — header 431 in WIN63's registry
 * (`_SafeCls_2046.as::_events[431]`). Its only subscriber is the notification handler.
 *
 * **Name DERIVED** — see {@link ClaimProductResultMessageParser} for why, and for why this sits
 * under `notifications/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2973/_SafeCls_3432.as
 */
export class ClaimProductResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ClaimProductResultMessageParser);
    }
}
