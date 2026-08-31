import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Why a fishing request was refused.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8114.
 *
 * This is for a request that should not have been made — not for a catch that simply escaped, which
 * is `CatchFailed` and is the ordinary outcome.
 *
 * Codes are an integer rather than a string so the message stays cheap, and the localisation key is
 * derived from the code. Codes are **append-only**: a retired one is never reused, or an old client
 * shows the wrong reason.
 *
 * See `docs/vortex-original/fishing.md` §4.
 */
export enum FishingErrorCode
{
    /** The furni clicked is not a fishing spot in any known zone. */
    NotASpot = 0,

    /** The player's fishing level is below the zone's requirement. */
    LevelTooLow = 1,

    /** The daily currency cap is reached — casting is pointless until it resets. */
    DailyCapReached = 2,

    /** Cast again too quickly, or the sighting had already expired. */
    TooSoon = 3,

    /** The sighting id is unknown, expired, or belongs to somebody else. */
    UnknownSighting = 4,

    /** The derby is not in its registration window. */
    DerbyClosed = 5,

    /**
     * The player is not standing next to the spot. Checked server-side because the client sends a
     * furni id and nothing else — without it any spot in the room can be fished from anywhere in it.
     */
    TooFarAway = 6,
}

/**
 * The highest code this build understands, read off the enum rather than written out.
 *
 * `known` used to name the last code by hand and was left at `DerbyClosed` when `TooFarAway` was
 * appended, so the newest refusal — the reach check — reported itself as unknown and showed the
 * generic text. Codes are append-only by design, which means that mistake is available on every
 * future addition; deriving the bound removes it.
 */
// TS-only: Vortex-only system — no AS3 counterpart.
const MAX_KNOWN_CODE: number = Math.max(
    ...Object.values(FishingErrorCode).filter((value): value is number => typeof value === 'number')
);

/**
 * The localisation key for a refusal, and the generic one when the code is newer than this build.
 *
 * Lives here beside the codes so the two cannot drift: the widget's status line and the notification
 * bubble both show the same refusal and would otherwise each carry their own copy of the prefix.
 */
// TS-only: Vortex-only system — no AS3 counterpart.
export function fishingErrorKey(code: number, known: boolean): string
{
    return known ? `vortex.fishing.error.${code}` : 'vortex.fishing.error.unknown';
}

export class VortexFishingErrorMessageParser implements IMessageParser
{
    // TS-only: a `FishingErrorCode`, kept as a raw int so an unknown future code still parses.
    private _code: number = 0;

    /**
     * The one number the code needs to be actionable, or zero when it needs none.
     *
     * Its meaning is the code's: for `LevelTooLow` it is the zone's required level. The client
     * cannot derive that — the refusal is what stops it ever learning which zone the spot is in —
     * and the server compared the two at exactly this moment.
     */
    // TS-only: Vortex-only field.
    private _detail: number = 0;

    // TS-only: Vortex-only accessor.
    get code(): number
    {
        return this._code;
    }

    // TS-only: Vortex-only accessor.
    get detail(): number
    {
        return this._detail;
    }

    /**
     * A code this build does not know still has to say *something*, so the caller can fall back to a
     * generic message rather than showing nothing. Definitions and codes are both append-only, so an
     * unknown value is always newer, never corrupt.
     */
    // TS-only: Vortex-only convenience.
    get known(): boolean
    {
        return this._code >= FishingErrorCode.NotASpot && this._code <= MAX_KNOWN_CODE;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._code = 0;
        this._detail = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._code = wrapper.readInt();
        this._detail = wrapper.readInt();

        return true;
    }
}
