/**
 * BadgeLeaderboardDataServerContext — everything cached for one (type, rarity) board.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge_leaderboard/server/BadgeLeaderboardDataServerContext.as
 *
 * `totalEntries` starts at -1 meaning "not known yet", which is what lets `canChunkExist()` allow a
 * first request for any chunk before the server has said how long the board is.
 */
import type {BadgeLeaderboardEntryData} from '@habbo/communication/messages/parser/users/BadgeLeaderboardEntryData';
import type {BadgeLeaderboardDataServerChunk} from './BadgeLeaderboardDataServerChunk';

export class BadgeLeaderboardDataServerContext
{
    // AS3: BadgeLeaderboardDataServerContext.as::type
    public type: number;

    // AS3: BadgeLeaderboardDataServerContext.as::rarity
    public rarity: number;

    // AS3: BadgeLeaderboardDataServerContext.as::key
    public key: string;

    // AS3: BadgeLeaderboardDataServerContext.as::totalEntries
    public totalEntries: number = -1;

    // AS3: BadgeLeaderboardDataServerContext.as::ownEntry
    public ownEntry: BadgeLeaderboardEntryData | null = null;

    /** Derived name — `_SafeStr_6323`: chunk index -> chunk. AS3 keys a `Dictionary`. */
    // AS3: BadgeLeaderboardDataServerContext.as::_SafeStr_6323
    public chunks: Map<number, BadgeLeaderboardDataServerChunk> = new Map();

    // AS3: BadgeLeaderboardDataServerContext.as::inFlightChunkIndices
    public inFlightChunkIndices: Map<number, boolean> = new Map();

    // AS3: BadgeLeaderboardDataServerContext.as::BadgeLeaderboardDataServerContext()
    constructor(type: number, rarity: number, key: string)
    {
        this.type = type;
        this.rarity = rarity;
        this.key = key;
    }
}
