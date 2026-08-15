import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 2905 in WIN63's registry (`_SafeCls_2046.as::_composers[2905]`). Five booleans, in AS3's
 * order; their meanings are derived from the checkbox order in the settings UI.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2905. Named for its one call site, `ChestNotificationSettingsUI::onSaveClicked()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2820/_SafeCls_2819.as
 */
export class SetWiredChestNotificationSettingsComposer extends MessageComposer<[number, number, boolean, boolean, boolean, boolean, boolean]>
{
    private _data: [number, number, boolean, boolean, boolean, boolean, boolean];

    // AS3: _SafeCls_2819.as::constructor
    constructor(chestId: number, mode: number, onDeposit: boolean, onWithdraw: boolean, onUpgrade: boolean, onCoins: boolean, onOther: boolean)
    {
        super();

        this._data = [chestId, mode, onDeposit, onWithdraw, onUpgrade, onCoins, onOther];
    }

    // AS3: _SafeCls_2819.as::getMessageArray()
    getMessageArray(): [number, number, boolean, boolean, boolean, boolean, boolean]
    {
        return this._data;
    }
}
