import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingDefinitionsMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingDefinitionsMessageParser';

/**
 * Every fishing definition table, pushed by the server.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8102. See `docs/vortex-original/fishing.md` §8.
 *
 * Arrives once at login and again on every reload an operator triggers, so a subscriber must be
 * idempotent — `FishingDefinitions.apply()` already drops a push whose version is not newer.
 */
export class VortexFishingDefinitionsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingDefinitionsMessageParser);
    }
}
