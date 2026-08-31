import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How a Hook Havoc attempt ended, after the server replayed it.
 *
 * Reconstructed from Habbo Origins. Header 8120. See `docs/vortex-original/fishing.md` §4.
 *
 * The client's own play is a prediction; **this is the answer**. A rejected timeline lands here as a
 * loss, indistinguishable to the player from missing the bar — which is the point.
 *
 * A win yields a Golden Fish, bonus XP, extra tokens, and a trophy that hangs visibly from the rod
 * as the avatar walks. `trophyHandItemId` is that trophy: a carry object at or above 1000, so it is
 * held rather than drunk. Zero when the attempt was lost.
 *
 * Losing costs nothing and fishing resumes immediately — Origins is explicit about that.
 */
export class VortexHookHavocResultMessageParser implements IMessageParser
{
    // TS-only: which attempt this answers.
    private _attemptId: number = 0;

    // TS-only: whether the bar filled in time, as the server's replay saw it.
    private _won: boolean = false;

    // TS-only: the Golden Fish caught, or 0 on a loss.
    private _speciesId: number = 0;

    // TS-only: already multiplied by the rod's golden multiplier.
    private _xpGained: number = 0;

    // TS-only: already multiplied, and already through the daily cap.
    private _currencyGained: number = 0;

    // TS-only: the trophy hanging from the rod. A carry object id; 0 on a loss.
    private _trophyHandItemId: number = 0;

    // TS-only: Vortex-only accessor.
    get attemptId(): number
    {
        return this._attemptId;
    }

    // TS-only: Vortex-only accessor.
    get won(): boolean
    {
        return this._won;
    }

    // TS-only: Vortex-only accessor.
    get speciesId(): number
    {
        return this._speciesId;
    }

    // TS-only: Vortex-only accessor.
    get xpGained(): number
    {
        return this._xpGained;
    }

    // TS-only: Vortex-only accessor.
    get currencyGained(): number
    {
        return this._currencyGained;
    }

    // TS-only: Vortex-only accessor.
    get trophyHandItemId(): number
    {
        return this._trophyHandItemId;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._attemptId = 0;
        this._won = false;
        this._speciesId = 0;
        this._xpGained = 0;
        this._currencyGained = 0;
        this._trophyHandItemId = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._attemptId = wrapper.readInt();
        this._won = wrapper.readBoolean();
        this._speciesId = wrapper.readInt();
        this._xpGained = wrapper.readInt();
        this._currencyGained = wrapper.readInt();
        this._trophyHandItemId = wrapper.readInt();

        return true;
    }
}
