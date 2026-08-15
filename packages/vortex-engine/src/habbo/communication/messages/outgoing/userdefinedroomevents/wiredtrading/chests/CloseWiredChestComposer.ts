import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 2935 in WIN63's registry (`_SafeCls_2046.as::_composers[2935]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2935. Named for its one call site, `WiredChestController::setClosedStatus()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3069/_SafeCls_3068.as
 */
export class CloseWiredChestComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_3068.as::constructor
    constructor(chestId: number)
    {
        super();

        this._data = [chestId];
    }

    // AS3: _SafeCls_3068.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
