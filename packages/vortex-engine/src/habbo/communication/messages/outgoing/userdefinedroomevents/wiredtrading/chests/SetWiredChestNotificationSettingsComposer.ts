import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Save a chest's notification preferences — header 2905 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[2905]`).
 *
 * **The five booleans are named from evidence, not from order.** `ChestNotificationSettingsUI`
 * loads the same five out of the chest's settings map under readable keys, and pushes them back in
 * that order: `notification_chest_full`, `notification_donation`,
 * `notification_someone_withdraws`, `notification_chest_empty`,
 * `notification_wired_transaction`. The first two are the "generic" checkbox group, the last three
 * the "wired" one — which is why the third onwards are hidden for a chest with wired disabled.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 2905. Named for its one call site, `ChestNotificationSettingsUI::onSaveClicked()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_2819.as
 */
export class SetWiredChestNotificationSettingsComposer extends MessageComposer<
    [number, number, boolean, boolean, boolean, boolean, boolean]
>
{
    private _data: [number, number, boolean, boolean, boolean, boolean, boolean];

    // AS3: _SafeCls_2819.as::_SafeCls_2819()
    constructor(
        chestId: number,
        notifyMode: number,
        notifyChestFull: boolean,
        notifyDonation: boolean,
        notifySomeoneWithdraws: boolean,
        notifyChestEmpty: boolean,
        notifyWiredTransaction: boolean
    )
    {
        super();

        this._data = [
            chestId,
            notifyMode,
            notifyChestFull,
            notifyDonation,
            notifySomeoneWithdraws,
            notifyChestEmpty,
            notifyWiredTransaction,
        ];
    }

    // AS3: _SafeCls_2819.as::getMessageArray()
    getMessageArray(): [number, number, boolean, boolean, boolean, boolean, boolean]
    {
        return this._data;
    }
}
