/**
 * The server's view of one placed furni, as delivered by `VortexFurniEditorDataMessageParser`.
 *
 * NOT ported from AS3 — Vortex-only staff tool. Kept as a plain shape rather than reusing the
 * parser directly: parsers are pooled and flushed between messages, so holding one as the window's
 * state would leave the window reading whichever message arrived last.
 */
export interface IFurniEditorState
{
    readonly objectId: number;
    /** 0 = floor, 1 = wall, matching the emulator's `ProductType`. */
    readonly productType: number;
    readonly definitionId: number;
    readonly spriteId: number;
    readonly definitionName: string;
    readonly x: number;
    readonly y: number;
    readonly zHundredths: number;
    readonly direction: number;
    readonly wallOffset: number;
    readonly extraData: string;
    readonly ownerId: number;
    readonly ownerName: string;
    /** Empty on success; otherwise the server's refusal code for the edit just attempted. */
    readonly error: string;
}
