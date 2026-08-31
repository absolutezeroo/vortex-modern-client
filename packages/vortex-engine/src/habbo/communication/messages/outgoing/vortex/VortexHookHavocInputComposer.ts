import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * The player's whole Hook Havoc attempt, sent once when it ends.
 *
 * Reconstructed from Habbo Origins. Header 8109. See `docs/vortex-original/fishing.md` §4.
 *
 * Hook Havoc is Origins' skill minigame: **Q** nudges the line left, **E** right, and the needle has
 * to stay centred while a green bar fills before time runs out. Guides warn to tap rather than hold,
 * because holding overbalances the line — so the input is a *sequence of nudges*, not a held axis.
 *
 * **The client plays it and the server replays it.** A minigame this tight is unplayable if the
 * server streams the needle back at any real latency, and a client that simply reported "I won" is
 * trivially faked — with a Golden Fish and bonus tokens on the line, neither end can own it alone.
 * So the timeline goes up and the server, holding the same seed it sent in `HookHavocStarted`, runs
 * the same attempt and decides.
 *
 * The timeline is a flat list of `tick` then `direction` pairs: -1 for Q, +1 for E. Flat rather than
 * a list of records because the wire has no framing for nested tuples and a pair is not worth
 * inventing one for.
 */
export class VortexHookHavocInputComposer extends MessageComposer<[number[]]>
{
    // TS-only: Vortex reconstruction — alternating tick and direction.
    private _timeline: number[];

    constructor(timeline: number[])
    {
        super();

        this._timeline = timeline;
    }

    // TS-only: `MessageComposer` contract.
    getMessageArray(): [number[]]
    {
        return [this._timeline];
    }
}
