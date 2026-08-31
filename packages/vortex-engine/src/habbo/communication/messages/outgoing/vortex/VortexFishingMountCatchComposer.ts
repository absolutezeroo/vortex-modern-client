import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Turns a catch record into a mounted-fish furni.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8103.
 *
 * Sends the record id, not the species or the weight: the record already holds both, and letting the
 * client name them would let it mint a trophy for a fish it never caught. The server charges for the
 * mint and writes the species and weight into the furni's `MapStuffData`.
 *
 * See `docs/vortex-original/fishing.md` §2.5.
 */
export class VortexFishingMountCatchComposer extends MessageComposer<[number]>
{
    // TS-only: Vortex-only composer — no AS3 counterpart.
    private _recordId: number;

    constructor(recordId: number)
    {
        super();

        this._recordId = recordId;
    }

    // TS-only: `MessageComposer` contract — one server-issued handle.
    getMessageArray(): [number]
    {
        return [this._recordId];
    }
}
