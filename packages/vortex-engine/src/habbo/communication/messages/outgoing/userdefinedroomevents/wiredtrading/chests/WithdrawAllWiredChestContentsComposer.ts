import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Empty a chest in one go — header 3611 in WIN63's registry (`_SafeCls_2046.as::_composers[3611]`).
 *
 * Sent only after the player confirms `${wiredchests.withdraw_all.confirm.title}`; the chest id is
 * the whole payload, so *what* comes out is entirely the server's decision.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages, and the emulator's 3611
 * is `FriendListUpdateComposer`, a server→client id in the other direction. Named for its one call
 * site, `WiredChestWrapperView::onWithdrawAllConfirmed()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2417/_SafeCls_3968.as
 */
export class WithdrawAllWiredChestContentsComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_3968.as::_data (name derived: the field is _SafeStr_4642 in every tree)
    private _data: [number];

    // AS3: _SafeCls_3968.as::_SafeCls_3968()
    constructor(chestId: number)
    {
        super();

        this._data = [chestId];
    }

    // AS3: _SafeCls_3968.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
