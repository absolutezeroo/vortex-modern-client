import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Save a chest's settings — header 3830 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[3830]`).
 *
 * Nine fields, in the order `ChestSettingsUI::onSaveClicked()` reads its controls. The two booleans
 * are the group's first and second checkbox; the three trailing integers are dropdown *ids*, not
 * positions.
 *
 * The last field is a control's `disabled` flag pushed straight onto the wire — AS3 sends the UI
 * state rather than a derived value, so its meaning is "this option was greyed out", not "this
 * option is off".
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 3830.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3187/_SafeCls_3186.as
 */
export class SaveWiredChestSettingsComposer extends MessageComposer<
    [number, string, string, boolean, boolean, number, number, number, boolean]
>
{
    private _data: [number, string, string, boolean, boolean, number, number, number, boolean];

    // AS3: _SafeCls_3186.as::_SafeCls_3186()
    constructor(
        chestId: number,
        name: string,
        description: string,
        option0: boolean,
        option1: boolean,
        chestState: number,
        openState: number,
        amountPreview: number,
        stateSectionDisabled: boolean
    )
    {
        super();

        this._data = [
            chestId,
            name,
            description,
            option0,
            option1,
            chestState,
            openState,
            amountPreview,
            stateSectionDisabled,
        ];
    }

    // AS3: _SafeCls_3186.as::getMessageArray()
    getMessageArray(): [number, string, string, boolean, boolean, number, number, number, boolean]
    {
        return this._data;
    }
}
