import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendFurniCancelLockParser} from '../../../parser/room/furniture/FriendFurniCancelLockParser';

/**
 * See `FriendFurniCancelLockParser`. The class name is **derived**, not recovered
 * (`_SafeCls_2700` in every tree).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2701/_SafeCls_2700.as
 */
export class FriendFurniCancelLockEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafeCls_2700.as::_SafeCls_2700()
    constructor(callback: MessageEventCallback)
    {
        super(callback, FriendFurniCancelLockParser);
    }
}
