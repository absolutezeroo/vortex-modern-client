import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MiniMailUnreadCountParser} from '../../parser/friendlist/MiniMailUnreadCountParser';

/**
 * The authoritative MiniMail unread count (header 74).
 *
 * Registered only when `client.minimail.embed.enabled` is set, as AS3 does.
 *
 * The class name is **derived**, not recovered — see `MiniMailUnreadCountParser`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1764/_SafeCls_2214.as
 */
export class MiniMailUnreadCountEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafePkg_1764/_SafeCls_2214.as::_SafeCls_2214()
    constructor(callback: MessageEventCallback)
    {
        super(callback, MiniMailUnreadCountParser);
    }
}
