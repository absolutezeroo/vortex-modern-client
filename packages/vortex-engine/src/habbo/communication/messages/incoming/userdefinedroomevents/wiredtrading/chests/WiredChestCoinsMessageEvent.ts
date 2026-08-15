import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestCoinsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestCoinsMessageParser';

/**
 * Header 1022 in WIN63's registry (`_SafeCls_2046.as::_events[1022]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 1022. Named for the AS3 handler it feeds, `CoinChestSubController::onCoinsMessage()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3883/_SafeCls_3882.as
 */
export class WiredChestCoinsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredChestCoinsMessageParser);
    }
}
