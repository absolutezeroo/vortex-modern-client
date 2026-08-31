/**
 * The fourth axis a species' availability turns on, next to hour, weekday and zone.
 *
 * Reconstructed from Habbo Origins, where the guides list "seasonal events" alongside time of day
 * and day of the week. **How Origins encodes a season is unknown** — these four are the obvious
 * reading and may well be wrong; see `docs/vortex-original/fishing.md` §11.
 *
 * Carried as a bit mask so a species can be in season for several at once, and so a fifth value can
 * be appended without moving the ones already assigned.
 */
export const FishingSeason = {
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    SPRING: 1 << 0,
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    SUMMER: 1 << 1,
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    AUTUMN: 1 << 2,
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    WINTER: 1 << 3,
} as const;

/** Every season — what a species available all year carries. */
// TS-only: Vortex reconstruction — no AS3 counterpart.
export const ALL_SEASONS =
    FishingSeason.SPRING | FishingSeason.SUMMER | FishingSeason.AUTUMN | FishingSeason.WINTER;
