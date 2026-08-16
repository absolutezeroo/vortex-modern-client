import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claim a habbicon already owed — a completed collection's reward. Header 662, from WIN63's own registry.
 *
 * **The name is DERIVED.** No tree and no emulator header carries these — see
 * `UserHabbiconsMessageEvent` for why. It is named for its one call site,
 * `HabbiconController.claimHabbicon()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2395/_SafeCls_2848.as
 */
export class ClaimHabbiconMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(habbiconId: number)
    {
        super();

        this._data = [habbiconId];
    }

    // AS3: _SafeCls_2848.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
