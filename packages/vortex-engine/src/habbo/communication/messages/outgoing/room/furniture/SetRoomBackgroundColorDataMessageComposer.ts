import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Apply a background toner's hue/saturation/lightness to the room.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3281.as
 *
 * Header 1647, from WIN63's registry (`_SafeCls_2046.as::_composers[1647]`).
 *
 * No emulator constant sits on 1647. `vortex-emulator` does declare
 * `SetRoomBackgroundColorDataEvent = 2019`, flagged UNRESOLVED with the note that "no matching
 * 'set background color' composer [was] located ... in either official AS3 revision" — this is
 * that composer, and 1647 is what the registry gives it. The class name here follows the
 * emulator's naming intent; the number does not.
 *
 * The toner's on/off button is *not* this message: AS3 sends the generic
 * `UseFurnitureMessageComposer` (3353) for that, which this port already had.
 */
export class SetRoomBackgroundColorDataMessageComposer extends MessageComposer<ConstructorParameters<typeof SetRoomBackgroundColorDataMessageComposer>>
{
    private _data: ConstructorParameters<typeof SetRoomBackgroundColorDataMessageComposer>;

    constructor(objectId: number, hue: number, saturation: number, lightness: number)
    {
        super();
        this._data = [objectId, hue, saturation, lightness];
    }

    getMessageArray()
    {
        return this._data;
    }
}
