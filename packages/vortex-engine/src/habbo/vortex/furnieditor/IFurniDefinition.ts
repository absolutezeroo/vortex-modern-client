/**
 * One `furniture_definitions` row — a furniture *type*, not a placed item.
 *
 * NOT ported from AS3 — Vortex-only staff tool. Mirrors the emulator's
 * `FurnitureDefinitionUpsertSpec`, which is what the server's write path consumes.
 *
 * Note what this does and does not govern. These fields are read by the *server*: the interaction
 * (`logic`), the footprint used for placement validation, stack height, the walk/sit/lay flags,
 * the state count and the trade policy — so editing them takes effect immediately for every placed
 * copy. What the client *draws* comes from the furnidata and .nitro assets instead, so changing
 * `width` here changes where the server allows the item, not the sprite the client renders.
 */
export interface IFurniDefinition
{
    readonly definitionId: number;
    readonly spriteId: number;
    readonly name: string;
    /** 0 = floor, 1 = wall, … — the emulator's `ProductType`. */
    readonly productType: number;
    /** The emulator's `FurnitureCategory` (1 = Default, 2 = WallPaper, …). */
    readonly furniCategory: number;
    /** The interaction: the logic class the room engine instantiates for this type. */
    readonly logic: string;
    readonly totalStates: number;
    readonly width: number;
    readonly length: number;
    /** Stack height in hundredths — the wire has no double. */
    readonly stackHeightHundredths: number;
    readonly canStack: boolean;
    readonly canWalk: boolean;
    readonly canSit: boolean;
    readonly canLay: boolean;
    readonly canRecycle: boolean;
    readonly canTrade: boolean;
    readonly canGroup: boolean;
    readonly canSell: boolean;
    /** 0 = Nobody, 1 = Controller, 2 = Everybody — the emulator's `FurnitureUsageType`. */
    readonly usagePolicy: number;
    readonly extraData: string;
    /** 0 = Legacy, 1 = Map, 2 = String, 3 = Vote, 4 = Empty, 5 = Number, 6 = Highscore, 7 = Crackable. */
    readonly stuffDataType: number;
}
