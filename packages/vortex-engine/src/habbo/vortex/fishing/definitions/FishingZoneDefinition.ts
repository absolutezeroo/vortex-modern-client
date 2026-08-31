/**
 * One fishing zone.
 *
 * Reconstructed from Habbo Origins, which has no client dump — see
 * `docs/vortex-original/fishing.md` §0 for how well any of this is known.
 *
 * A zone is a furni class — the spot somebody places — plus a level requirement and its slice of the
 * species table. Origins runs three: Infobus Park 1-29, Port Hana 30-69, Snouthill Pier 70+.
 *
 * **A spot depletes.** Origins runs fishing as a *session*: the player clicks a fish shadow, the
 * avatar fishes on its own, and the spot runs dry after an unpredictable number of catches — "one
 * fish or several" — at which point the player moves to another shadow. An earlier revision of this
 * class said a spot never depletes, which was the largest single error in the first design.
 *
 * The bounds below are what the **server** rolls a spot's stock between. The client shows them and
 * decides nothing.
 *
 * Keyed by furni class rather than item id: every copy behaves the same, and placing a second one
 * changes nothing.
 */
export class FishingZoneDefinition
{
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public constructor(
        // TS-only: Vortex reconstruction.
        public readonly id: number,
        /** Localisation key, not a display string. */
        // TS-only: Vortex reconstruction.
        public readonly nameKey: string,
        // TS-only: Vortex reconstruction.
        public readonly furniClass: string,
        /** Fishing level required to fish here at all. Zero means everybody. */
        // TS-only: Vortex reconstruction.
        public readonly requiredLevel: number,
        /** Fewest catches a fresh spot yields before running dry. */
        // TS-only: Vortex reconstruction.
        public readonly minCatches: number,
        /** Most catches a fresh spot yields. Equal to `minCatches` for a fixed stock. */
        // TS-only: Vortex reconstruction.
        public readonly maxCatches: number
    )
    {
    }
}
