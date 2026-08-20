import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Save a chest's settings — header 3830 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[3830]`).
 *
 * Nine fields, in the order `ChestSettingsUI::onSaveClicked()` reads its controls. The two middle
 * booleans are the access checkboxes, named from the settings keys the same screen loads them from
 * (`everyone_can_open`, `everyone_can_donate`); the three trailing integers are dropdown *ids*, not
 * positions.
 *
 * `openState` and `amountPreview` are meaningful only for a furniture chest — a coin chest never
 * shows those two dropdowns, and sends whatever they were left at.
 *
 * **The last field is `is_wired_enabled`**, not a UI flag despite how it is written. AS3 pushes the
 * upgrade button's `disabled` state, and that button is disabled exactly when the chest already has
 * wired — so the wire receives "wired is enabled". Reading it as "the control was greyed out" would
 * be transcribing the expression instead of the meaning.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 3830.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_3186.as
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
        everyoneCanOpen: boolean,
        everyoneCanDonate: boolean,
        chestState: number,
        openState: number,
        amountPreview: number,
        wiredEnabled: boolean
    )
    {
        super();

        this._data = [
            chestId,
            name,
            description,
            everyoneCanOpen,
            everyoneCanDonate,
            chestState,
            openState,
            amountPreview,
            wiredEnabled,
        ];
    }

    // AS3: _SafeCls_3186.as::getMessageArray()
    getMessageArray(): [number, string, string, boolean, boolean, number, number, number, boolean]
    {
        return this._data;
    }
}
