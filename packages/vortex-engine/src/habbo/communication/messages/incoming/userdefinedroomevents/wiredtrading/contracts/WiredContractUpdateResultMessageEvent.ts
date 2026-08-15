import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredContractUpdateResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractUpdateResultMessageParser';

/**
 * Header 3720 in WIN63's registry (`_SafeCls_2046.as::_events[3720]`). Subscribed by
 * `WiredContractController`.
 *
 * **Name DERIVED** — named for the AS3 handler it feeds, `WiredContractController::onContractUpdateResult()`. No unobfuscated tree
 * carries the contract messages and the emulator has no constant for 3720.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2430/_SafeCls_3091.as
 */
export class WiredContractUpdateResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredContractUpdateResultMessageParser);
    }
}
