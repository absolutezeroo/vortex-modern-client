/**
 * Which fields of a placed furni an edit request intends to rewrite.
 *
 * NOT ported from AS3 — the furni editor is a Vortex-only staff tool and has no Habbo equivalent,
 * so there is no AS3 source to trace to. The values are the wire contract with the emulator's
 * `Vortex.Primitives/Rooms/Enums/FurniEditField.cs`; changing one side alone silently misapplies
 * edits rather than failing.
 *
 * The editor always sends every value on the wire, so this mask is what separates "set X to 3" from
 * "leave X alone".
 */
export const FurniEditFieldEnum = {
    NONE: 0,

    /** X and Y, moved together — a tile is a pair, and the server's placement path takes both. */
    POSITION: 1 << 0,

    ROTATION: 1 << 1,

    /** Z as a free altitude, not clamped to the stack under the item. */
    ALTITUDE: 1 << 2,

    /** Wall items only. */
    WALL_OFFSET: 1 << 3,

    EXTRA_DATA: 1 << 4,

    OWNER: 1 << 5,

    /** The furniture definition ("base"). The server refuses a definition of a different product
     * type, so a floor item can never become a wall item. */
    DEFINITION: 1 << 6
} as const;

export type FurniEditField = typeof FurniEditFieldEnum[keyof typeof FurniEditFieldEnum];
