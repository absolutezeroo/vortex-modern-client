/**
 * The badge-leaderboard link format, and the two owner-count helpers the badge display uses.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_2379.as` and the identifier exists in no tree.
 * Named after `LINK_ID`, which is `"badge_leaderboard"`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/_SafeCls_2379.as
 */
export class BadgeLeaderboardUtils
{
    // AS3: .../groups/_SafeCls_2379.as::LINK_ID
    public static readonly LINK_ID: string = 'badge_leaderboard';

    // AS3: .../groups/_SafeCls_2379.as::LINK_PATTERN
    public static readonly LINK_PATTERN: string = 'badge_leaderboard/';

    // AS3: .../groups/_SafeCls_2379.as::OWNER_COUNT_CAP
    // Name DERIVED (`_SafeStr_10628`): the count at and above which the exact number is hidden.
    public static readonly OWNER_COUNT_CAP: number = 1000;

    // AS3: .../groups/_SafeCls_2379.as::DEFAULT_RARITY
    public static readonly DEFAULT_RARITY: number = -1;

    // AS3: .../groups/_SafeCls_2379.as::DEFAULT_PAGE
    public static readonly DEFAULT_PAGE: number = 0;

    // AS3: .../groups/_SafeCls_2379.as::PAGE_SIZE
    public static readonly PAGE_SIZE: number = 10;

    // AS3: .../groups/_SafeCls_2379.as::TOTAL_BADGES
    public static readonly TOTAL_BADGES: number = 0;

    // AS3: .../groups/_SafeCls_2379.as::BADGES_BY_RARITY
    public static readonly BADGES_BY_RARITY: number = 1;

    // AS3: .../groups/_SafeCls_2379.as::ACHIEVEMENT_LEVEL
    public static readonly ACHIEVEMENT_LEVEL: number = 2;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_TOTAL_BADGES
    public static readonly FRAME_STYLE_TOTAL_BADGES: number = 10000;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_ACHIEVEMENT_LEVEL
    public static readonly FRAME_STYLE_ACHIEVEMENT_LEVEL: number = 10001;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_RARE
    public static readonly FRAME_STYLE_RARE: number = 10002;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_VERY_RARE
    public static readonly FRAME_STYLE_VERY_RARE: number = 10003;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_MYTHICAL
    public static readonly FRAME_STYLE_MYTHICAL: number = 10004;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_LEGENDARY
    public static readonly FRAME_STYLE_LEGENDARY: number = 10005;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_UNIQUE
    public static readonly FRAME_STYLE_UNIQUE: number = 10006;

    // AS3: .../groups/_SafeCls_2379.as::FRAME_STYLE_UNCOMMON
    // Out of order on purpose: uncommon was added after the others and took the next free id
    // rather than being inserted between total-badges and rare.
    public static readonly FRAME_STYLE_UNCOMMON: number = 10007;

    // AS3: .../groups/_SafeCls_2379.as::getLink()
    public static getLink(
        badgeId: number,
        rarity: number = BadgeLeaderboardUtils.DEFAULT_RARITY,
        page: number = BadgeLeaderboardUtils.DEFAULT_PAGE
    ): string
    {
        return `${BadgeLeaderboardUtils.LINK_PATTERN}${badgeId}/${rarity}/${page}`;
    }

    // AS3: .../groups/_SafeCls_2379.as::getPageForRank()
    // Rank 1 is on page 0, which is why the max() sits inside the division rather than outside.
    public static getPageForRank(rank: number): number
    {
        if(rank < 0) return 0;

        return Math.trunc(Math.max(0, rank - 1) / BadgeLeaderboardUtils.PAGE_SIZE);
    }

    // AS3: .../groups/_SafeCls_2379.as::formatOwnerCount()
    public static formatOwnerCount(count: number): string
    {
        if(count >= BadgeLeaderboardUtils.OWNER_COUNT_CAP) return '1000+';

        return count.toString();
    }

    // AS3: .../groups/_SafeCls_2379.as::shouldShowOwnerCount()
    // Zero is hidden as well as the cap: a badge nobody owns says nothing rather than "0".
    public static shouldShowOwnerCount(count: number): boolean
    {
        return count > 0 && count < BadgeLeaderboardUtils.OWNER_COUNT_CAP;
    }
}
