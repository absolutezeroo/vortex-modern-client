import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    HabboActivityPointNotificationMessageEventParser
} from '../../parser/notifications/HabboActivityPointNotificationMessageEventParser';

/**
 * Event for a single activity-point balance change (header 2046).
 *
 * Sent whenever one seasonal currency moves - a duckets/diamonds payout, a purchase, a
 * quest reward - as opposed to `ActivityPointsMessageEvent` (509), which carries the
 * whole wallet at once.
 *
 * The class is obfuscated in the primary tree (`_SafeCls_2011`); the name is recovered
 * from `sources/win63_version/habbo/communication/messages/incoming/notifications/HabboActivityPointNotificationMessageEvent.as`.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2011.as
 */
export class HabboActivityPointNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2011.as::HabboActivityPointNotificationMessageEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboActivityPointNotificationMessageEventParser);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2011.as::get amount()
    get amount(): number
    {
        return (this.parser as HabboActivityPointNotificationMessageEventParser).amount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2011.as::get change()
    get change(): number
    {
        return (this.parser as HabboActivityPointNotificationMessageEventParser).change;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2010/_SafeCls_2011.as::get type()
    get type(): number
    {
        return (this.parser as HabboActivityPointNotificationMessageEventParser).type;
    }
}