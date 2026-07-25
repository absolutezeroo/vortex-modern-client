/**
 * The complete set of values one furni edit puts on the wire.
 *
 * NOT ported from AS3 — Vortex-only staff tool. The edit's mask decides which of these the server
 * actually reads; the rest are inert filler, present because the wire shape is fixed.
 */
export interface IFurniEditPayload
{
    readonly x: number;
    readonly y: number;
    /** Altitude in hundredths — the wire has no double. */
    readonly zHundredths: number;
    readonly direction: number;
    readonly wallOffset: number;
    readonly extraData: string;
    readonly ownerName: string;
    readonly definitionId: number;
}
