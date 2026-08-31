/**
 * One rod quality tier.
 *
 * Reconstructed from Habbo Origins — see `docs/vortex-original/fishing.md` §2.
 *
 * **The rod is not the fishing level, and an earlier revision of this class fused the two.** Origins
 * runs them in parallel: the *fishing level* unlocks zones and nothing else observed, while the *rod
 * quality* raises the multiplier on normal and Golden fish and improves the chance of triggering
 * Hook Havoc. A player can be deep into the level curve on a poor rod, or the reverse.
 *
 * `handItemId` is at or above 1000, above the client's `AvatarLogic.CARRY_ITEM_LAST_CONSUMABLE` —
 * below it the rod would play the drinking animation instead of being held.
 *
 * Multipliers are thousandths (1000 is x1.00). Integers, because a float on the wire is a rounding
 * argument nobody needs. **The real values are unknown**: no guide publishes them.
 */
export class RodLevelDefinition
{
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public constructor(
        // TS-only: rod quality tier, counted from 1. Not the fishing level.
        public readonly quality: number,
        /** Cumulative rod XP at which this tier begins. */
        // TS-only: Vortex reconstruction.
        public readonly xpThreshold: number,
        /** A localisation key, never a display string. */
        // TS-only: Vortex reconstruction.
        public readonly nameKey: string,
        /** The carry object shown in the avatar's hand. */
        // TS-only: Vortex reconstruction.
        public readonly handItemId: number,
        /** Thousandths, applied to a normal catch. */
        // TS-only: Vortex reconstruction.
        public readonly catchMultiplier: number,
        /** Thousandths, applied to a Golden Fish. */
        // TS-only: Vortex reconstruction.
        public readonly goldenMultiplier: number,
        /**
         * Tenths of a percent that a catch triggers Hook Havoc. Origins says a better rod improves
         * the chance; the numbers are unknown.
         */
        // TS-only: Vortex reconstruction.
        public readonly hookHavocChance: number
    )
    {
    }
}
