import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {BadgeLeaderboardEntryData} from './BadgeLeaderboardEntryData';

/**
 * One chunk of the badge leaderboard: `size` consecutive entries starting at `page * size`, for a
 * given board `type` and `rarity`.
 *
 * `ownEntry` is the reading user's own row, sent alongside so the board can pin it even when the
 * page on screen is nowhere near their rank. It is optional — the boolean before it says whether
 * one follows.
 *
 * **The name is DERIVED**; see `BadgeLeaderboardEntryData` for why. The seven accessors below are
 * unobfuscated in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1891/_SafeCls_3883.as
 */
export class BadgeLeaderboardMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3883.as::_SafeStr_4778
    private _type: number = 0;

    // AS3: _SafeCls_3883.as::_SafeStr_7896
    private _rarity: number = -1;

    // AS3: _SafeCls_3883.as::_SafeStr_4734
    private _page: number = 0;

    // AS3: _SafeCls_3883.as::_SafeStr_7525
    private _size: number = 0;

    // AS3: _SafeCls_3883.as::_totalEntries
    private _totalEntries: number = 0;

    // AS3: _SafeCls_3883.as::_entries
    private _entries: BadgeLeaderboardEntryData[] = [];

    // AS3: _SafeCls_3883.as::_ownEntry
    private _ownEntry: BadgeLeaderboardEntryData | null = null;

    // AS3: _SafeCls_3883.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: _SafeCls_3883.as::get rarity()
    get rarity(): number
    {
        return this._rarity;
    }

    // AS3: _SafeCls_3883.as::get page()
    get page(): number
    {
        return this._page;
    }

    // AS3: _SafeCls_3883.as::get size()
    get size(): number
    {
        return this._size;
    }

    // AS3: _SafeCls_3883.as::get totalEntries()
    get totalEntries(): number
    {
        return this._totalEntries;
    }

    // AS3: _SafeCls_3883.as::get entries()
    get entries(): BadgeLeaderboardEntryData[]
    {
        return this._entries;
    }

    // AS3: _SafeCls_3883.as::get ownEntry()
    get ownEntry(): BadgeLeaderboardEntryData | null
    {
        return this._ownEntry;
    }

    // AS3: _SafeCls_3883.as::flush()
    flush(): boolean
    {
        this._type = 0;
        this._rarity = -1;
        this._page = 0;
        this._size = 0;
        this._totalEntries = 0;
        this._entries = [];
        this._ownEntry = null;

        return true;
    }

    // AS3: _SafeCls_3883.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._type = wrapper.readInt();
        this._rarity = wrapper.readInt();
        this._page = wrapper.readInt();
        this._size = wrapper.readInt();
        this._totalEntries = wrapper.readInt();

        this._entries = [];

        const count = wrapper.readInt();

        for(let index = 0; index < count; index++)
        {
            this._entries.push(new BadgeLeaderboardEntryData(wrapper));
        }

        if(wrapper.readBoolean())
        {
            this._ownEntry = new BadgeLeaderboardEntryData(wrapper);
        }

        return true;
    }
}
