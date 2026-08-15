import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';

/**
 * Header 2976 in WIN63's registry (`_SafeCls_2046.as::_events[2976]`). Subscribed by
 * `WiredContractController`.
 *
 * **Name DERIVED** — named for the AS3 handler it feeds, `WiredContractController::onContractContents()`. No unobfuscated tree
 * carries the contract messages and the emulator has no constant for 2976.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2430/_SafeCls_2429.as
 */
export class WiredContractContentsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredContractContentsMessageParser);
    }
}
