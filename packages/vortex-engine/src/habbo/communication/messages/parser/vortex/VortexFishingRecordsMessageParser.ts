import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/** One species the player has caught at least once. */
export class FishingRecord
{
    public constructor(
        public readonly speciesId: number,
        /** Heaviest ever landed. This is what the records book shows and what a derby scores. */
        public readonly bestWeight: number,
        public readonly caughtCount: number,
        /** Unix seconds of the personal best. */
        public readonly bestAt: number
    )
    {
    }
}

/**
 * Every species this player has caught, with their personal best for each.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8116.
 *
 * **Only caught species are sent.** The records tab draws the *whole* table from
 * `FishingDefinitions` and greys out the rows this message does not mention — that visible gap is
 * the progression loop, and sending a zero row for every uncaught species would cost bytes to say
 * nothing.
 *
 * Pushed on login and after any catch that changes a best or a count, so nothing has to poll.
 *
 * See `docs/vortex-original/fishing.md` §2.6.
 */
export class VortexFishingRecordsMessageParser implements IMessageParser
{
    // TS-only: Vortex-only — no AS3 counterpart.
    private _records: FishingRecord[] = [];

    // TS-only: Vortex-only accessor.
    get records(): FishingRecord[]
    {
        return this._records;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._records = [];

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._records.push(new FishingRecord(
                wrapper.readInt(),   // speciesId
                wrapper.readInt(),   // bestWeight
                wrapper.readInt(),   // caughtCount
                wrapper.readInt()    // bestAt, unix seconds
            ));
        }

        return true;
    }
}
