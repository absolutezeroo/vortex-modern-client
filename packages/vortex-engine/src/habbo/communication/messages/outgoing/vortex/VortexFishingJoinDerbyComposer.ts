import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Enters the player into a derby during its registration window.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8105.
 *
 * The server rejects it outside the window; the client does not police the clock, because a client
 * clock is not evidence.
 *
 * See `docs/vortex-original/fishing.md` §9 — scoring is the top ten heaviest catches by combined
 * weight, which is why entering is all the client has to send: every catch after this counts
 * automatically.
 */
export class VortexFishingJoinDerbyComposer extends MessageComposer<[number]>
{
    // TS-only: Vortex-only composer — no AS3 counterpart.
    private _derbyId: number;

    constructor(derbyId: number)
    {
        super();

        this._derbyId = derbyId;
    }

    // TS-only: `MessageComposer` contract — one server-issued handle.
    getMessageArray(): [number]
    {
        return [this._derbyId];
    }
}
