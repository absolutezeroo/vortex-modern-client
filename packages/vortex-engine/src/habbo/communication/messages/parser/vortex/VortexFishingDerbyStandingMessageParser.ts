import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/** One row of a derby board. */
export class FishingDerbyEntry
{
    public constructor(
        public readonly rank: number,
        public readonly userName: string,
        /** Combined weight of the player's ten heaviest catches this derby. */
        public readonly score: number
    )
    {
    }
}

/**
 * A derby's live standings.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8112.
 *
 * **Scoring is the top ten heaviest catches, combined weight** — taken from bobba.me's derby because
 * it rewards consistency *and* size, and because only the top ten count, so grinding does not pay.
 * The client never computes a score; every catch is folded in server-side and this arrives already
 * ranked.
 *
 * `ownRank` is sent separately from the visible rows: a player outside the top N still needs to see
 * where they stand, and the board only carries as many rows as it can draw.
 *
 * The same standings drive the `HighScoreStuffData` board furni, which needs no new wire format.
 *
 * See `docs/vortex-original/fishing.md` §9.
 */
export class VortexFishingDerbyStandingMessageParser implements IMessageParser
{
    // TS-only: which derby these standings belong to.
    private _derbyId: number = 0;

    // TS-only: Unix seconds. The client counts down; the server decides when it is over.
    private _endsAt: number = 0;

    // TS-only: as many ranked rows as the board draws.
    private _entries: FishingDerbyEntry[] = [];

    // TS-only: zero when this player has not entered or has no scoring catch yet.
    private _ownRank: number = 0;

    // TS-only: Vortex-only accessor.
    get derbyId(): number
    {
        return this._derbyId;
    }

    // TS-only: Vortex-only accessor.
    get endsAt(): number
    {
        return this._endsAt;
    }

    // TS-only: Vortex-only accessor.
    get entries(): FishingDerbyEntry[]
    {
        return this._entries;
    }

    // TS-only: Vortex-only accessor.
    get ownRank(): number
    {
        return this._ownRank;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._derbyId = 0;
        this._endsAt = 0;
        this._entries = [];
        this._ownRank = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._derbyId = wrapper.readInt();
        this._endsAt = wrapper.readInt();

        const entryCount = wrapper.readInt();

        for(let i = 0; i < entryCount; i++)
        {
            this._entries.push(new FishingDerbyEntry(
                wrapper.readInt(),
                wrapper.readString(),
                wrapper.readInt()
            ));
        }

        this._ownRank = wrapper.readInt();

        return true;
    }
}
