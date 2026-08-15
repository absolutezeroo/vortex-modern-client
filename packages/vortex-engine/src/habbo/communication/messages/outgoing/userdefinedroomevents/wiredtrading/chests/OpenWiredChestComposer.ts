import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 806 in WIN63's registry (`_SafeCls_2046.as::_composers[806]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 806. Named for its one call site, `WiredChestController::open()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2598/_SafeCls_2597.as
 */
export class OpenWiredChestComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_2597.as::constructor
    constructor(chestId: number)
    {
        super();

        this._data = [chestId];
    }

    // AS3: _SafeCls_2597.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
