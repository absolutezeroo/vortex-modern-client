import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestItemsUpdatedMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestItemsUpdatedMessageParser';

/**
 * Header 2738 in WIN63's registry (`_SafeCls_2046.as::_events[2738]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2738. Named for the AS3 handler it feeds, `FurniChestSubController::onItemsUpdated()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2478/_SafeCls_3379.as
 */
export class WiredChestItemsUpdatedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredChestItemsUpdatedMessageParser);
    }
}
