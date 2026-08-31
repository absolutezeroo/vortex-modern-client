import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingCatchResultMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingCatchResultMessageParser';

/**
 * A cast landed — the first and only time the species is named.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8108. Everything in it was decided server-side
 * before it was written; a `FishingPlayerState` push follows with the new totals.
 */
export class VortexFishingCatchResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingCatchResultMessageParser);
    }
}
