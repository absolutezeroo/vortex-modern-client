import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestItemsChunkMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestItemsChunkMessageParser';

/**
 * Header 2323 in WIN63's registry (`_SafeCls_2046.as::_events[2323]`). A chest
 * arrives in fragments; see the parser.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2323. Named for the AS3 handler it feeds, `FurniChestSubController::onItemsChunk()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2478/_SafeCls_2672.as
 */
export class WiredChestItemsChunkMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredChestItemsChunkMessageParser);
    }
}
