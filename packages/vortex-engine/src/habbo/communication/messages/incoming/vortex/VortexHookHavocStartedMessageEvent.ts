import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VortexHookHavocStartedMessageParser} from '@habbo/communication/messages/parser/vortex/VortexHookHavocStartedMessageParser';

/**
 * Reconstructed from Habbo Origins — see `docs/vortex-original/fishing.md` §4.
 */
export class VortexHookHavocStartedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VortexHookHavocStartedMessageParser);
    }
}
