import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendFurniStartConfirmationParser} from '../../../parser/room/furniture/FriendFurniStartConfirmationParser';

/**
 * See `FriendFurniStartConfirmationParser`. The class name is **derived**, not recovered
 * (`_SafeCls_3759` in every tree).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2701/_SafeCls_3759.as
 */
export class FriendFurniStartConfirmationEvent extends MessageEvent implements IMessageEvent
{
    // AS3: .../_SafeCls_3759.as::_SafeCls_3759()
    constructor(callback: MessageEventCallback)
    {
        super(callback, FriendFurniStartConfirmationParser);
    }
}
