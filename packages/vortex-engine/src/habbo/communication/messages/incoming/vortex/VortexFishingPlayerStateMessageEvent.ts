import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingPlayerStateMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingPlayerStateMessageParser';

/**
 * This player's level, XP, currency, cap usage and collectibles.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8104. Pushed on login and after every catch, so
 * the records tab and the level bar stay honest without polling.
 */
export class VortexFishingPlayerStateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingPlayerStateMessageParser);
    }
}
