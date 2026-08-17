/**
 * BadgeLeaderboardPageData — the 10-row page the view actually renders.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/BadgeLeaderboardPageData.as
 *
 * Sliced out of a 50-row chunk by the data server; `totalEntries` and `ownEntry` come from the
 * chunk that carried them, so paging never loses the user's own row.
 */
import type {BadgeLeaderboardEntryData} from '@habbo/communication/messages/parser/users/BadgeLeaderboardEntryData';

export class BadgeLeaderboardPageData
{
    // AS3: BadgeLeaderboardPageData.as::_SafeStr_4778 (derived: `type`)
    private _type: number;

    // AS3: BadgeLeaderboardPageData.as::_SafeStr_7896 (derived: `rarity`)
    private _rarity: number;

    // AS3: BadgeLeaderboardPageData.as::_SafeStr_4734 (derived: `page`)
    private _page: number;

    // AS3: BadgeLeaderboardPageData.as::_totalEntries
    private _totalEntries: number;

    // AS3: BadgeLeaderboardPageData.as::_entries
    private _entries: BadgeLeaderboardEntryData[];

    // AS3: BadgeLeaderboardPageData.as::_ownEntry
    private _ownEntry: BadgeLeaderboardEntryData | null;

    // AS3: BadgeLeaderboardPageData.as::BadgeLeaderboardPageData()
    constructor(
        type: number,
        rarity: number,
        page: number,
        totalEntries: number,
        entries: BadgeLeaderboardEntryData[] | null,
        ownEntry: BadgeLeaderboardEntryData | null
    )
    {
        this._type = type;
        this._rarity = rarity;
        this._page = page;
        this._totalEntries = totalEntries;
        this._entries = entries == null ? [] : entries.concat();
        this._ownEntry = ownEntry;
    }

    // AS3: BadgeLeaderboardPageData.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: BadgeLeaderboardPageData.as::get rarity()
    get rarity(): number
    {
        return this._rarity;
    }

    // AS3: BadgeLeaderboardPageData.as::get page()
    get page(): number
    {
        return this._page;
    }

    // AS3: BadgeLeaderboardPageData.as::get totalEntries()
    get totalEntries(): number
    {
        return this._totalEntries;
    }

    // AS3: BadgeLeaderboardPageData.as::get entries()
    get entries(): BadgeLeaderboardEntryData[]
    {
        return this._entries;
    }

    // AS3: BadgeLeaderboardPageData.as::get ownEntry()
    get ownEntry(): BadgeLeaderboardEntryData | null
    {
        return this._ownEntry;
    }
}
