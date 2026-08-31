/**
 * One fishing level.
 *
 * Reconstructed from Habbo Origins — see `docs/vortex-original/fishing.md` §2.
 *
 * **Separate from the rod.** In Origins the fishing level unlocks zones and nothing else observed;
 * everything about reward size lives on the rod's quality tier instead. Fusing the two was the
 * second-biggest error in the first design of this system.
 *
 * The curve's real numbers are unknown. bobba.me's reimplementation runs 1-100 with level 30 at
 * ~21 500 XP and level 99 at ~14.3M, which is a shape to start from, not a fact about Origins.
 */
export class FishingLevelDefinition
{
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public constructor(
        // TS-only: Vortex reconstruction.
        public readonly level: number,
        /** Cumulative fishing XP at which this level begins. */
        // TS-only: Vortex reconstruction.
        public readonly xpThreshold: number
    )
    {
    }
}
