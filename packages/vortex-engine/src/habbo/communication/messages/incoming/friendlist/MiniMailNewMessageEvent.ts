import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MiniMailNewMessageParser} from '../../parser/friendlist/MiniMailNewMessageParser';

/**
 * A new MiniMail message arrived (header 3884).
 *
 * Registered only when `client.minimail.embed.enabled` is set, as AS3 does — the embedded
 * MiniMail is a hotel-level opt-in.
 *
 * The class name is **derived**, not recovered — see `MiniMailNewMessageParser`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1764/_SafeCls_1958.as
 */
export class MiniMailNewMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafePkg_1764/_SafeCls_1958.as::_SafeCls_1958()
    constructor(callback: MessageEventCallback)
    {
        super(callback, MiniMailNewMessageParser);
    }
}
