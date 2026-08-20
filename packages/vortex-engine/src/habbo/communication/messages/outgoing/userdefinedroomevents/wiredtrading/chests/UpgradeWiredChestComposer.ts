import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Header 3407 in WIN63's registry (`_SafeCls_2046.as::_composers[3407]`).
 *
 * 3407 is also a server->client header in this port (`SelfDonationResultMessageEvent`). The two
 * tables are independent, so that is not a collision.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and the emulator has no
 * constant for 3407. Named for its one call site, `WiredChestUpgradeConfirmationView::onBuyClicked()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_3807.as
 */
export class UpgradeWiredChestComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    // AS3: _SafeCls_3807.as::constructor
    constructor(chestId: number, upgradeType: number)
    {
        super();

        this._data = [chestId, upgradeType];
    }

    // AS3: _SafeCls_3807.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
