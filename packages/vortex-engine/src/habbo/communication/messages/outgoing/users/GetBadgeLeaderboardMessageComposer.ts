import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for one chunk of the badge leaderboard. Header 1225, from WIN63's own registry
 * (`_composers[1225] = _SafeCls_3493`).
 *
 * `chunkIndex` counts in units of `size`, not of the 10-row page the board shows — the data server
 * fetches 5 pages at a time and slices locally, which is why the request never carries a page.
 *
 * **The name is DERIVED**; the emulator has no header for it and `win63_version` predates the
 * board. Named for its one call site, `BadgeLeaderboardDataServer.synchronizeChunk()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1789/_SafeCls_3493.as
 */
export class GetBadgeLeaderboardMessageComposer extends MessageComposer<[number, number, number, number]>
{
    // AS3: _SafeCls_3493.as::_SafeStr_4556
    private _data: [number, number, number, number];

    constructor(type: number, rarity: number, chunkIndex: number, size: number)
    {
        super();

        this._data = [type, rarity, chunkIndex, size];
    }

    // AS3: _SafeCls_3493.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
