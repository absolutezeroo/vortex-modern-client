import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexHookHavocResultMessageParser} from '@habbo/communication/messages/parser/vortex/VortexHookHavocResultMessageParser';

/**
 * Reconstructed from Habbo Origins — see `docs/vortex-original/fishing.md` §4.
 */
export class VortexHookHavocResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexHookHavocResultMessageParser);
    }
}
