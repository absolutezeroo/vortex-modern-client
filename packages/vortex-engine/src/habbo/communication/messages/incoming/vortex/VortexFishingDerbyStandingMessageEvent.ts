import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingDerbyStandingMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingDerbyStandingMessageParser';

/**
 * A derby's live standings, already ranked.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8112. Scoring is the top ten heaviest catches by
 * combined weight; the same standings drive the `HighScoreStuffData` board furni.
 */
export class VortexFishingDerbyStandingMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingDerbyStandingMessageParser);
    }
}
