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

export class VortexFishingErrorMessageParser implements IMessageParser
{
    // TS-only: a `FishingErrorCode`, kept as a raw int so an unknown future code still parses.
    private _code: number = 0;

    // TS-only: Vortex-only accessor.
    get code(): number
    {
        return this._code;
    }

    /**
     * A code this build does not know still has to say *something*, so the caller can fall back to a
     * generic message rather than showing nothing. Definitions and codes are both append-only, so an
     * unknown value is always newer, never corrupt.
     */
    // TS-only: Vortex-only convenience.
    get known(): boolean
    {
        return this._code >= FishingErrorCode.NotASpot && this._code <= FishingErrorCode.DerbyClosed;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._code = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._code = wrapper.readInt();

        return true;
    }
}
