import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredOpenContractMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredOpenContractMessageParser';

/**
 * Header 1479 in WIN63's registry (`_SafeCls_2046.as::_events[1479]`). Subscribed by
 * `WiredContractController`.
 *
 * **Name DERIVED** — named for the AS3 handler it feeds, `WiredContractController::onOpenContract()`. No unobfuscated tree
 * carries the contract messages and the emulator has no constant for 1479.
 *
 * The emulator does define 1479 — as `Game2GetTotalGroupLeaderboardEvent`, in its
 * *client→server* table. Independent tables, so not a collision, but it would name this wrong.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2430/_SafeCls_3800.as
 */
export class WiredOpenContractMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredOpenContractMessageParser);
    }
}
