import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Triggers a habbicon bubble above the sender's own avatar in the current room. Header 1176,
 * from WIN63's own registry (`_composers[1176] = _SafeCls_3701`).
 *
 * **The name is DERIVED.** Habbicons postdate every unobfuscated tree (see
 * `UserHabbiconsMessageEvent`), and `win63_version` carries no habbicon code at all to
 * cross-reference for a filename either. Named for its one call site,
 * `HabbiconSelector.sendTriggerHabbicon()`.
 *
 * TS-only: not yet registered in `HabboMessages.ts` (shared file — see the habbicon selector
 * port's report for the two lines it needs).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2395/_SafeCls_3701.as
 */
export class TriggerHabbiconMessageComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_3701.as::_SafeStr_6120
    private _data: [number];

    constructor(habbiconId: number)
    {
        super();

        this._data = [habbiconId];
    }

    // AS3: _SafeCls_3701.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
