import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Everything about *this* player's fishing, pushed on login and after every change.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8104.
 *
 * The client never computes any of it. Level, XP, the daily cap and the session decay are all
 * server-side (§5), and this is the one message that says where the player stands. It arrives after
 * every catch, so it is also how the records tab and the level bar stay honest without polling.
 *
 * See `docs/vortex-original/fishing.md` §5.1 and §7.
 */
export class VortexFishingPlayerStateMessageParser implements IMessageParser
{
    // TS-only: the fishing level — the one that unlocks zones. Separate from the rod below.
    private _fishingLevel: number = 0;

    // TS-only: cumulative fishing XP, which the level curve is walked against.
    private _fishingXp: number = 0;

    // TS-only: the rod's quality tier — multipliers and the Hook Havoc chance. NOT the level.
    private _rodQuality: number = 0;

    // TS-only: cumulative rod XP, walked against a curve of its own.
    private _rodXp: number = 0;

    // TS-only: see `_level`.
    private _currency: number = 0;

    // TS-only: see `_level`. Together with `_dailyCap` this is what greys out the cast button.
    private _currencyEarnedToday: number = 0;

    // TS-only: see `_level`. Zero means uncapped.
    private _dailyCap: number = 0;

    // TS-only: see `_level`. Drives the diminishing-returns curve's display (§5.1).
    private _sessionCatchCount: number = 0;

    // TS-only: see `_level`. Ids of the bottles, statues and badge this player holds.
    private _collectibleIds: number[] = [];

    // TS-only: Vortex-only accessor.
    get fishingLevel(): number
    {
        return this._fishingLevel;
    }

    // TS-only: Vortex-only accessor.
    get fishingXp(): number
    {
        return this._fishingXp;
    }

    // TS-only: Vortex-only accessor.
    get rodQuality(): number
    {
        return this._rodQuality;
    }

    // TS-only: Vortex-only accessor.
    get rodXp(): number
    {
        return this._rodXp;
    }

    // TS-only: Vortex-only accessor.
    get currency(): number
    {
        return this._currency;
    }

    // TS-only: Vortex-only accessor.
    get currencyEarnedToday(): number
    {
        return this._currencyEarnedToday;
    }

    // TS-only: Vortex-only accessor.
    get dailyCap(): number
    {
        return this._dailyCap;
    }

    // TS-only: Vortex-only accessor.
    get sessionCatchCount(): number
    {
        return this._sessionCatchCount;
    }

    // TS-only: Vortex-only accessor.
    get collectibleIds(): number[]
    {
        return this._collectibleIds;
    }

    /** A zero cap means uncapped, so this is false rather than immediately true. */
    // TS-only: Vortex-only convenience read by the cast button.
    get dailyCapReached(): boolean
    {
        return this._dailyCap > 0 && this._currencyEarnedToday >= this._dailyCap;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._fishingLevel = 0;
        this._fishingXp = 0;
        this._rodQuality = 0;
        this._rodXp = 0;
        this._currency = 0;
        this._currencyEarnedToday = 0;
        this._dailyCap = 0;
        this._sessionCatchCount = 0;
        this._collectibleIds = [];

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._fishingLevel = wrapper.readInt();
        this._fishingXp = wrapper.readInt();
        this._rodQuality = wrapper.readInt();
        this._rodXp = wrapper.readInt();
        this._currency = wrapper.readInt();
        this._currencyEarnedToday = wrapper.readInt();
        this._dailyCap = wrapper.readInt();
        this._sessionCatchCount = wrapper.readInt();

        const collectibleCount = wrapper.readInt();

        for(let i = 0; i < collectibleCount; i++)
        {
            this._collectibleIds.push(wrapper.readInt());
        }

        return true;
    }
}
