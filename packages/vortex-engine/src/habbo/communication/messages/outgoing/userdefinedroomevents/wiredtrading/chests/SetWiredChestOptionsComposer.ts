import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 2907 in WIN63's registry (`_SafeCls_2046.as::_composers[2907]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2907. Named for its one call site, `WiredChestWrapperView::onOptionsChanged()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_3366.as
 */
export class SetWiredChestOptionsComposer extends MessageComposer<[number, boolean, boolean, number]>
{
    private _data: [number, boolean, boolean, number];

    // AS3: _SafeCls_3366.as::constructor
    constructor(chestId: number, locked: boolean, hidden: boolean, mode: number)
    {
        super();

        this._data = [chestId, locked, hidden, mode];
    }

    // AS3: _SafeCls_3366.as::getMessageArray()
    getMessageArray(): [number, boolean, boolean, number]
    {
        return this._data;
    }
}
