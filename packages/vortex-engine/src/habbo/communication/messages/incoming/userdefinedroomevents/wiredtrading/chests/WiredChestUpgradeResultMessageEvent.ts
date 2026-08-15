import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestUpgradeResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestUpgradeResultMessageParser';

/**
 * Header 2721 in WIN63's registry (`_SafeCls_2046.as::_events[2721]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2721. Named for the AS3 handler it feeds, `WiredChestController::onUpgradeChestResult()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3246/_SafeCls_3245.as
 */
export class WiredChestUpgradeResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredChestUpgradeResultMessageParser);
    }
}
