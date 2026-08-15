import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 2843 in WIN63's registry (`_SafeCls_2046.as::_composers[2843]`).
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2843. Named for its one call site, `CoinChestSubController::onWithdrawClick()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3396/_SafeCls_3395.as
 */
export class WithdrawWiredChestCoinsComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    // AS3: _SafeCls_3395.as::constructor
    constructor(chestId: number, amount: number)
    {
        super();

        this._data = [chestId, amount];
    }

    // AS3: _SafeCls_3395.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
