/**
 * RoomObjectAvatarHabbiconUpdateMessage
 *
 * Carries the Habbicon a user just triggered into their avatar's logic, which writes it onto the
 * model as `figure_habbicon` and starts the six-second window the bubble lives for.
 *
 * AS3 extends `RoomObjectUpdateStateMessage`; this port has no such class and every sibling here
 * (`RoomObjectAvatarPlayerValueUpdateMessage`, `RoomObjectAvatarSignUpdateMessage`, …) extends
 * `RoomObjectUpdateMessage` instead, so this one follows them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/messages/RoomObjectAvatarHabbiconUpdateMessage.as
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarHabbiconUpdateMessage extends RoomObjectUpdateMessage
{
    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarHabbiconUpdateMessage.as::RoomObjectAvatarHabbiconUpdateMessage()
    constructor(habbiconId: number)
    {
        super(null, null);

        this._habbiconId = habbiconId;
    }

    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarHabbiconUpdateMessage.as::_habbiconId
    private _habbiconId: number;

    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarHabbiconUpdateMessage.as::get habbiconId()
    get habbiconId(): number
    {
        return this._habbiconId;
    }
}
