import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingRecordsMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingRecordsMessageParser';

/**
 * The player's per-species records — what the fishing tab draws over the species table.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8116. Carries only the species actually caught;
 * everything else is greyed out from the definitions.
 */
export class VortexFishingRecordsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingRecordsMessageParser);
    }
}
