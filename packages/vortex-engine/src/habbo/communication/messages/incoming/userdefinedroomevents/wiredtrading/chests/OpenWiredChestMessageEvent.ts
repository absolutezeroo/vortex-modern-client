import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    OpenWiredChestMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/OpenWiredChestMessageParser';

/**
 * Header 1174 in WIN63's registry (`_SafeCls_2046.as::_events[1174]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 1174. Named for the AS3 handler it feeds, `WiredChestController::onOpenChest()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2478/_SafeCls_3156.as
 */
export class OpenWiredChestMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, OpenWiredChestMessageParser);
    }
}
