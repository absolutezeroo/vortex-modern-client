import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Hook Havoc has triggered — play it.
 *
 * Reconstructed from Habbo Origins. Header 8118. See `docs/vortex-original/fishing.md` §4.
 *
 * Everything the client needs to run the minigame and nothing it could use to cheat at it: the
 * server keeps the same `seed` and replays the player's input timeline against it, so a fabricated
 * win does not survive.
 *
 * A trigger is random per catch, weighted by the rod's quality — **and during a Fishing Frenzy every
 * catch triggers one**, which is the same statement as "you only catch Golden Fish during a frenzy",
 * because winning Hook Havoc is how a Golden Fish is caught.
 *
 * The numbers are unknown: no guide publishes the drift rate, the bar's fill rate or the time limit.
 * They are live-configurable for exactly that reason.
 */
export class VortexHookHavocStartedMessageParser implements IMessageParser
{
    // TS-only: the attempt's handle; the input timeline names it back.
    private _attemptId: number = 0;

    // TS-only: drives the needle's drift. The server keeps it and replays the attempt.
    private _seed: number = 0;

    // TS-only: milliseconds before the attempt fails on its own.
    private _durationMs: number = 0;

    // TS-only: how fast the green bar fills while the needle is centred, per tick.
    private _fillRate: number = 0;

    // TS-only: how far off centre still counts as centred, on a 0-1000 scale.
    private _tolerance: number = 0;

    // TS-only: Vortex-only accessor.
    get attemptId(): number
    {
        return this._attemptId;
    }

    // TS-only: Vortex-only accessor.
    get seed(): number
    {
        return this._seed;
    }

    // TS-only: Vortex-only accessor.
    get durationMs(): number
    {
        return this._durationMs;
    }

    // TS-only: Vortex-only accessor.
    get fillRate(): number
    {
        return this._fillRate;
    }

    // TS-only: Vortex-only accessor.
    get tolerance(): number
    {
        return this._tolerance;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._attemptId = 0;
        this._seed = 0;
        this._durationMs = 0;
        this._fillRate = 0;
        this._tolerance = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._attemptId = wrapper.readInt();
        this._seed = wrapper.readInt();
        this._durationMs = wrapper.readInt();
        this._fillRate = wrapper.readInt();
        this._tolerance = wrapper.readInt();

        return true;
    }
}
