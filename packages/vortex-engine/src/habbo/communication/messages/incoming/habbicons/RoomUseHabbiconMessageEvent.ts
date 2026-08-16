import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomUseHabbiconMessageParser} from '@habbo/communication/messages/parser/habbicons/RoomUseHabbiconMessageParser';

/**
 * Somebody in the room used a habbicon. Header 1547, from WIN63's own registry.
 *
 * **The name is DERIVED, not recovered** — see `UserHabbiconsMessageEvent` for why no habbicon
 * message can be corroborated. It is named for what `HabbiconController.onRoomUseHabbicon()` does
 * with it: re-broadcast as `ROOM_USE_HABBICON` for whoever is drawing the room.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2102/_SafeCls_2836.as
 */
export class RoomUseHabbiconMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomUseHabbiconMessageParser);
    }
}
