import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 3514 in WIN63's registry (`_SafeCls_2046.as::_composers[3514]`). Carries only the chest id — the amount lives in the
 * server-side deposit flow, not here.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 3514. Named for its one call site, `CoinChestSubController::onDepositClick()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3758/_SafeCls_3757.as
 */
export class DepositWiredChestCoinsComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_3757.as::constructor
    constructor(chestId: number)
    {
        super();

        this._data = [chestId];
    }

    // AS3: _SafeCls_3757.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
