import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Picks the room type a new user starts with.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3967.as
 * Sent by AS3: `RoomPicker.onButtonSelect()` — the room TYPE (a string out of
 * `new.user.flow.roomTypes`, e.g. "10"), not a room id.
 *
 * Header 3267, from WIN63's registry (`_composers[3267] = _SafeCls_3967`); the emulator corroborates
 * it as `SelectInitialRoomEvent`, which is where the name comes from.
 */
export class SelectInitialRoomMessageComposer extends MessageComposer<[string]>
{
    private _data: [string];

    constructor(roomType: string)
    {
        super();

        this._data = [roomType];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
