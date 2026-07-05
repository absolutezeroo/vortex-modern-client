import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboGroupBadgesMessageParser} from "@habbo/communication";

/**
 * Event for in-client link messages sent by the server
 *
 * The server sends a link string that should be routed to the appropriate
 * link event tracker via ComponentContext.createLinkEvent().
 *
 * @see source_as_win63/habbo/communication/messages/incoming/users/HabboGroupBadgesMessageEvent.as
 */
export class HabboGroupBadgesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, HabboGroupBadgesMessageParser);
    }

    get badges(): Map<number, string> | null
    {
        return (this._parser as HabboGroupBadgesMessageParser).badges;
    }
}