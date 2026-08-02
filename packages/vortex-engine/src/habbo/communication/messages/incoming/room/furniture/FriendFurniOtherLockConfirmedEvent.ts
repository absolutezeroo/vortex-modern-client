import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendFurniOtherLockConfirmedParser} from '../../../parser/room/furniture/FriendFurniOtherLockConfirmedParser';

/**
 * See `FriendFurniOtherLockConfirmedParser`. The class name is **derived**, not recovered
 * (`_SafeCls_3535` in every tree).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2701/_SafeCls_3535.as
 */
export class FriendFurniOtherLockConfirmedEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafeCls_3535.as::_SafeCls_3535()
    constructor(callback: MessageEventCallback)
    {
        super(callback, FriendFurniOtherLockConfirmedParser);
    }
}
