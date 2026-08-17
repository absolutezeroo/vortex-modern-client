/**
 * BadgeLeaderboardDataServerChunk — 50 consecutive rows as the server sent them, plus when.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/server/BadgeLeaderboardDataServerChunk.as
 */
import type {BadgeLeaderboardEntryData} from '@habbo/communication/messages/parser/users/BadgeLeaderboardEntryData';

export class BadgeLeaderboardDataServerChunk
{
    /** Derived name — `_SafeStr_7009`: which 50-row block this is. */
    // AS3: BadgeLeaderboardDataServerChunk.as::_SafeStr_7009
    public chunkIndex: number;

    // AS3: BadgeLeaderboardDataServerChunk.as::totalEntries
    public totalEntries: number;

    // AS3: BadgeLeaderboardDataServerChunk.as::entries
    public entries: BadgeLeaderboardEntryData[];

    // AS3: BadgeLeaderboardDataServerChunk.as::ownEntry
    public ownEntry: BadgeLeaderboardEntryData | null;

    // AS3: BadgeLeaderboardDataServerChunk.as::lastSynchronizedAt
    public lastSynchronizedAt: number;

    // AS3: BadgeLeaderboardDataServerChunk.as::BadgeLeaderboardDataServerChunk()
    constructor(
        chunkIndex: number,
        totalEntries: number,
        entries: BadgeLeaderboardEntryData[] | null,
        ownEntry: BadgeLeaderboardEntryData | null,
        lastSynchronizedAt: number
    )
    {
        this.chunkIndex = chunkIndex;
        this.totalEntries = totalEntries;
        this.entries = entries == null ? [] : entries;
        this.ownEntry = ownEntry;
        this.lastSynchronizedAt = lastSynchronizedAt;
    }
}
