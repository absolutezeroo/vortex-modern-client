import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishSightedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishSightedMessageParser';

/**
 * A fish is swimming past a spot — the cue the player clicks on.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8106. Deliberately species-agnostic: naming the
 * species here would let a client ignore the common ones.
 */
export class VortexFishSightedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishSightedMessageParser);
    }
}
