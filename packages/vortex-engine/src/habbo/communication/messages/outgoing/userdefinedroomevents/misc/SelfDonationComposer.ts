import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Give yourself furniture — header 1119 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[1119]`). Sandbox environments only; the client refuses to send it
 * anywhere else, and the server refuses it again.
 *
 * `legacyPosterId` is coalesced to the empty string when absent, in the composer itself: AS3 does
 * `param3 == null ? "" : param3` rather than leaving the caller to remember, because a null would
 * be written as the string "null".
 *
 * **Name DERIVED** — the class is `_SafeCls_3986` in the primary tree, `win63_version` predates the
 * tool, and the emulator has no constant for 1119. Named for what it does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3987/_SafeCls_3986.as
 */
export class SelfDonationComposer extends MessageComposer<[boolean, number, string, number]>
{
    // AS3: _SafeCls_3986.as::_SafeStr_4642 (the composer's own payload array)
    private _data: [boolean, number, string, number];

    // AS3: _SafeCls_3986.as::_SafeCls_3986()
    constructor(isWallItem: boolean, typeId: number, legacyPosterId: string | null, amount: number)
    {
        super();

        this._data = [isWallItem, typeId, legacyPosterId ?? '', amount];
    }

    // AS3: _SafeCls_3986.as::getMessageArray()
    getMessageArray(): [boolean, number, string, number]
    {
        return this._data;
    }
}
