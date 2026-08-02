import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    BadgeReceivedEventParser
} from '@habbo/communication/messages/parser/inventory/badges/BadgeReceivedEventParser';

/**
 * Incoming: a badge was granted to this user (header 2840).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2931/_SafeCls_3204.as
 * (class name recovered from
 * sources/win63_version/habbo/communication/messages/incoming/inventory/badges/BadgeReceivedEvent.as)
 */
export class BadgeReceivedEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2931/_SafeCls_3204.as::_SafeCls_3204()
    constructor(callback: MessageEventCallback)
    {
        super(callback, BadgeReceivedEventParser);
    }
}
