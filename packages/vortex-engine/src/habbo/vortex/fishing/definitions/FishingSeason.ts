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

/**
 * Which season a date falls in, as a single-bit mask.
 *
 * **DERIVED, and stated as such.** `FishSpeciesDefinition.isActiveAt()` has taken a season argument
 * since it was written and had no caller until the Fish-O-Pedia hub, so nothing in this port ever
 * had to answer "which season is it". `docs/vortex-original/fishing.md` §11 records that how Origins
 * encodes or decides a season is unknown, so this is the obvious reading and not a recovered rule:
 * meteorological quarters on the NORTHERN hemisphere, keyed off UTC.
 *
 * The server is the authority the moment it has an opinion — it decides what a cast yields
 * (fishing.md §9) — and this only ever colours what the client *displays*. If the server starts
 * sending the season, replace the body and delete this comment; do not add a second guess beside it.
 */
// TS-only: Vortex reconstruction — no AS3 counterpart.
export function seasonForDate(date: Date): number
{
    const month = date.getUTCMonth();

    if(month <= 1 || month === 11) return FishingSeason.WINTER;
    if(month <= 4) return FishingSeason.SPRING;
    if(month <= 7) return FishingSeason.SUMMER;

    return FishingSeason.AUTUMN;
}
