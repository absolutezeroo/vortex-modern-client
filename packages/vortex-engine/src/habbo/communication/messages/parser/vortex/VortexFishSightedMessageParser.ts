import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A fish is swimming past a spot. This is what the player clicks on.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8106.
 *
 * **It deliberately does not name the species.** A client that knew what was passing could ignore
 * every common fish and only ever cast on the rare ones, which would quietly multiply everybody's
 * luck. The species is named for the first time in `CatchResult`, after the roll.
 *
 * `golden` is the exception and is safe to send: a golden sighting is *visibly* different — it is
 * the thing the player is meant to notice and hurry for — and it says nothing about which species is
 * underneath it.
 *
 * `durationMs` is how long the sighting stays castable. The server re-checks it on `Cast`; this copy
 * exists only to animate the cue.
 *
 * See `docs/vortex-original/fishing.md` §4 and §5.
 */
export class VortexFishSightedMessageParser implements IMessageParser
{
    // TS-only: the handle a `Cast` names. Issued by the server, so it cannot be pointed elsewhere.
    private _sightingId: number = 0;

    // TS-only: which spot to draw the cue on.
    private _spotItemId: number = 0;

    // TS-only: a rare golden sighting — visibly different, and worth more (§9).
    private _golden: boolean = false;

    // TS-only: how long the cue stays castable. Advisory; the server re-checks on Cast.
    private _durationMs: number = 0;

    // TS-only: Vortex-only accessor.
    get sightingId(): number
    {
        return this._sightingId;
    }

    // TS-only: Vortex-only accessor.
    get spotItemId(): number
    {
        return this._spotItemId;
    }

    // TS-only: Vortex-only accessor.
    get golden(): boolean
    {
        return this._golden;
    }

    // TS-only: Vortex-only accessor.
    get durationMs(): number
    {
        return this._durationMs;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._sightingId = 0;
        this._spotItemId = 0;
        this._golden = false;
        this._durationMs = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._sightingId = wrapper.readInt();
        this._spotItemId = wrapper.readInt();
        this._golden = wrapper.readBoolean();
        this._durationMs = wrapper.readInt();

        return true;
    }
}
