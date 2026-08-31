import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ends the current fishing session early.
 *
 * Reconstructed from Habbo Origins. Header 8107. See `docs/vortex-original/fishing.md` §1.
 *
 * Sent when the player walks away or closes the panel. It carries nothing: the server knows which
 * session belongs to which player, and a client naming somebody else's would be naming a thing it
 * has no business knowing.
 *
 * Not required for correctness — a session also ends when the spot depletes, and the server is free
 * to end one for its own reasons. This only spares it from simulating a session nobody is watching.
 */
export class VortexStopFishingComposer extends MessageComposer<[]>
{
    // TS-only: `MessageComposer` contract — the message has no payload.
    getMessageArray(): []
    {
        return [];
    }
}
