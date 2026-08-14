import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Lock or unlock wired chests — header 1630 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1630]`).
 *
 * Two booleans, and the second is the dangerous one: `allChests` means every chest in the room
 * rather than only this player's, which is why the chests tab puts a confirmation dialog in front of
 * it and gates the button on `isRoomOwnerOrStaff()` where the other two only need write permission.
 *
 * **Name DERIVED** — no unobfuscated tree carries this composer and the emulator has no constant
 * for 1630. Named for what it does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_3599.as
 */
export class SetWiredChestsLockedComposer extends MessageComposer<[boolean, boolean]>
{
    private _data: [boolean, boolean];

    // AS3: _SafeCls_3599.as::_SafeCls_3599()
    constructor(locked: boolean, allChests: boolean)
    {
        super();

        this._data = [locked, allChests];
    }

    // AS3: _SafeCls_3599.as::getMessageArray()
    getMessageArray(): [boolean, boolean]
    {
        return this._data;
    }
}
