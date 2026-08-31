/**
 * Hook Havoc — the client half of the minigame, and the mirror of the server's replay.
 *
 * NOT ported from AS3 — Vortex-only system. Reconstructed from Habbo Origins: **Q** nudges the line
 * left, **E** right, the needle has to stay centred while a green bar fills, and the guides warn to
 * tap rather than hold because holding overbalances the line. See
 * `docs/vortex-original/fishing.md` §4.
 *
 * **Every constant and every operation here is wire contract.** The server issues a seed, this plays
 * against it, the whole input timeline goes back, and
 * `../vortex-emulator/Vortex.Fishing/HookHavocSimulation.cs` runs the identical attempt to decide.
 * A drift of one operation and a fair attempt scores as a loss — so this file mirrors that one
 * statement for statement, and neither may change without the other.
 *
 * It knows nothing about windows: `tick()` advances one step and answers the state to draw, which is
 * what lets the same arithmetic be checked in `scripts/check-fishing.mjs` under Node.
 */

/** How long one simulated step lasts. Ticks are the unit an input names. */
export const HOOK_HAVOC_TICK_MS = 100;

/** Hundredths of a percent. The bar is full at 100.00%. */
export const HOOK_HAVOC_FULL_BAR = 10000;

/** How far one tap moves the needle. */
const NUDGE_STRENGTH = 6;

/**
 * A tap on the tick immediately after another moves the needle twice as far. This is the "do not
 * hold" the guides warn about, expressed as arithmetic: holding a key produces consecutive ticks,
 * and consecutive ticks overshoot.
 */
const OVERBALANCE_MULTIPLIER = 2;

/** How far the current drifts each tick, before the player corrects for it. */
const MAX_DRIFT_PER_TICK = 3;

/** The bar empties at half the rate it fills, so a slip costs less than it earns. */
const DRAIN_DIVISOR = 2;

/** Nudge left. What the client sends for a Q. */
export const HOOK_HAVOC_LEFT = -1;

/** Nudge right. What the client sends for an E. */
export const HOOK_HAVOC_RIGHT = 1;

/**
 * The 32-bit xorshift both ends run.
 *
 * Not `Math.random()`: the drift has to be reproducible on the server from the seed alone, and a
 * runtime's own generator is neither seedable nor identical across engines. Four operations, the
 * same everywhere — the same reason the snow-war port carries its own.
 */
class Xorshift32
{
    // TS-only: Vortex-only.
    private _state: number;

    // TS-only: Vortex-only.
    constructor(seed: number)
    {
        // Zero is xorshift's fixed point: seeded with it the generator returns zero forever and the
        // needle never drifts. Any non-zero substitute will do, and this is the server's.
        this._state = seed === 0 ? 2463534242 : seed >>> 0;
    }

    /** A value in [min, max], both ends included. */
    // TS-only: Vortex-only.
    public next(min: number, max: number): number
    {
        this._state ^= this._state << 13;
        this._state >>>= 0;
        this._state ^= this._state >>> 17;
        this._state ^= this._state << 5;
        this._state >>>= 0;

        return min + (this._state % (max - min + 1));
    }
}

/** What one tick left behind, for the panel to draw. */
export interface IHookHavocState
{
    // TS-only: Vortex-only — signed, and unbounded in principle; the panel clamps it to its track.
    readonly needle: number;

    // TS-only: Vortex-only — 0 to HOOK_HAVOC_FULL_BAR.
    readonly fill: number;

    // TS-only: Vortex-only — true once the bar filled or the time ran out.
    readonly finished: boolean;

    // TS-only: Vortex-only — the client's own reading. The server's verdict is what counts.
    readonly won: boolean;
}

/**
 * One attempt, played a tick at a time.
 *
 * The caller drives it: `nudge()` while a key is pressed, `tick()` every
 * {@link HOOK_HAVOC_TICK_MS}, and `timeline` when it is over.
 */
export class HookHavocGame
{
    // TS-only: Vortex-only.
    private readonly _rng: Xorshift32;

    // TS-only: Vortex-only.
    private readonly _totalTicks: number;

    // TS-only: Vortex-only.
    private readonly _fillRate: number;

    // TS-only: Vortex-only.
    private readonly _tolerance: number;

    /** Flat `tick, direction` pairs — what the composer sends and the server replays. */
    // TS-only: Vortex-only.
    private readonly _timeline: number[] = [];

    // TS-only: Vortex-only.
    private _tick: number = 0;

    // TS-only: Vortex-only.
    private _needle: number = 0;

    // TS-only: Vortex-only.
    private _fill: number = 0;

    /** The tick the previous nudge landed on, for the overbalance test. */
    // TS-only: Vortex-only.
    private _previousInputTick: number = Number.MIN_SAFE_INTEGER;

    /** At most one nudge per tick, matching what the server can replay from a `tick, direction` pair. */
    // TS-only: Vortex-only.
    private _pending: number = 0;

    // TS-only: Vortex-only.
    private _won: boolean = false;

    // TS-only: Vortex-only.
    constructor(seed: number, durationMs: number, fillRate: number, tolerance: number)
    {
        this._rng = new Xorshift32(seed);
        this._totalTicks = Math.max(1, Math.floor(durationMs / HOOK_HAVOC_TICK_MS));
        this._fillRate = fillRate;
        this._tolerance = tolerance;
    }

    /** How far the bar has filled, 0 to 1, for a progress display. */
    // TS-only: Vortex-only.
    public get progress(): number
    {
        return this._fill / HOOK_HAVOC_FULL_BAR;
    }

    /** The flat pairs to send once the attempt ends. */
    // TS-only: Vortex-only.
    public get timeline(): number[]
    {
        return this._timeline;
    }

    /**
     * Records a nudge for the tick now running.
     *
     * A second nudge inside the same tick is dropped rather than queued: the wire carries one
     * `tick, direction` pair, so a queued second would be replayed on the following tick — where the
     * overbalance rule would double it, and the server would score an attempt the player did not
     * play.
     */
    // TS-only: Vortex-only.
    public nudge(direction: number): void
    {
        if(this._pending !== 0) return;
        if(direction !== HOOK_HAVOC_LEFT && direction !== HOOK_HAVOC_RIGHT) return;

        this._pending = direction;
    }

    /**
     * Advances one step, in the server's order: drift, then the tick's nudge, then the bar.
     *
     * The drift is drawn every tick whether or not the player acted, which is what keeps the two
     * generators in step no matter what was typed.
     */
    // TS-only: Vortex-only.
    public tick(): IHookHavocState
    {
        if(this._tick >= this._totalTicks || this._won)
        {
            return {needle: this._needle, fill: this._fill, finished: true, won: this._won};
        }

        this._needle += this._rng.next(-MAX_DRIFT_PER_TICK, MAX_DRIFT_PER_TICK);

        if(this._pending !== 0)
        {
            const strength = this._tick === this._previousInputTick + 1
                ? NUDGE_STRENGTH * OVERBALANCE_MULTIPLIER
                : NUDGE_STRENGTH;

            this._needle += this._pending * strength;
            this._timeline.push(this._tick, this._pending);
            this._previousInputTick = this._tick;
            this._pending = 0;
        }

        this._fill += Math.abs(this._needle) <= this._tolerance
            ? this._fillRate
            : -Math.floor(this._fillRate / DRAIN_DIVISOR);
        this._fill = Math.max(0, Math.min(HOOK_HAVOC_FULL_BAR, this._fill));

        this._tick++;

        if(this._fill >= HOOK_HAVOC_FULL_BAR) this._won = true;

        return {
            needle: this._needle,
            fill: this._fill,
            finished: this._won || this._tick >= this._totalTicks,
            won: this._won
        };
    }
}
