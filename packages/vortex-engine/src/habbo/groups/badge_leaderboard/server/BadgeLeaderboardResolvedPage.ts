/**
 * BadgeLeaderboardResolvedPage — a page sliced out of a chunk, with the provenance the data server
 * needs to decide whether to deliver it and whether to refresh behind it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/server/BadgeLeaderboardResolvedPage.as
 */
import type {BadgeLeaderboardPageData} from '../BadgeLeaderboardPageData';

export class BadgeLeaderboardResolvedPage
{
    // AS3: BadgeLeaderboardResolvedPage.as::data
    public data: BadgeLeaderboardPageData;

    /** Derived name — `_SafeStr_7009`: the chunk this page was cut from. */
    // AS3: BadgeLeaderboardResolvedPage.as::_SafeStr_7009
    public chunkIndex: number;

    // AS3: BadgeLeaderboardResolvedPage.as::chunkSyncTime
    public chunkSyncTime: number;

    // AS3: BadgeLeaderboardResolvedPage.as::isStale
    public isStale: boolean;

    // AS3: BadgeLeaderboardResolvedPage.as::BadgeLeaderboardResolvedPage()
    constructor(
        data: BadgeLeaderboardPageData,
        chunkIndex: number,
        chunkSyncTime: number,
        isStale: boolean
    )
    {
        this.data = data;
        this.chunkIndex = chunkIndex;
        this.chunkSyncTime = chunkSyncTime;
        this.isStale = isStale;
    }
}
