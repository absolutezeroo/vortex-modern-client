import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexFishingErrorMessageParser} from '@habbo/communication/messages/parser/vortex/VortexFishingErrorMessageParser';

/**
 * Why a fishing request was refused.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8114. For a request that should not have been
 * made — a catch that merely escaped is `CatchFailed`, which is not an error.
 */
export class VortexFishingErrorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexFishingErrorMessageParser);
    }
}
