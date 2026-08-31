import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Starts a fishing session at a spot.
 *
 * Reconstructed from Habbo Origins. Header 8101. See `docs/vortex-original/fishing.md` §1.
 *
 * **This is not a cast.** Origins fishing is a *session*: the player clicks a fish shadow, the avatar
 * fishes on its own, and catches arrive one after another until the spot runs dry. An earlier
 * revision of this class was `VortexFishingCastComposer` and modelled one request per fish, which is
 * the wrong interaction — the client asks once and then only listens.
 *
 * It names the spot's room item, and nothing else. Whether the player is close enough, high enough
 * level, and whether that spot still has stock are all the server's to answer.
 */
export class VortexStartFishingComposer extends MessageComposer<[number]>
{
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    private _spotItemId: number;

    constructor(spotItemId: number)
    {
        super();

        this._spotItemId = spotItemId;
    }

    // TS-only: `MessageComposer` contract.
    getMessageArray(): [number]
    {
        return [this._spotItemId];
    }
}
