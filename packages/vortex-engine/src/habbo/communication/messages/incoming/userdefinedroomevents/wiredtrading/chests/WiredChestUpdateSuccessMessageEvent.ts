import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestUpdateSuccessMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestUpdateSuccessMessageParser';

/**
 * Header 1957 in WIN63's registry (`_SafeCls_2046.as::_events[1957]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 1957. Named for the AS3 handler it feeds, `WiredChestController::onUpdateSuccess()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2478/_SafeCls_2477.as
 */
export class WiredChestUpdateSuccessMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredChestUpdateSuccessMessageParser);
    }
}
