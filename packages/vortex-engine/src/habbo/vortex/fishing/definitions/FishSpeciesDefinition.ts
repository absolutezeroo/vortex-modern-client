/**
 * One species, as the server defines it.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.2.
 *
 * **`catchRate` is the whole difficulty model.** There is no minigame, so there is no skill to erase
 * rarity: a rare fish is rare because it seldom appears and often escapes, and no amount of practice
 * changes either. That property is why the design settled here — see §8 of the document for the
 * deeper version that was dropped and what it had to do to keep the same guarantee.
 *
 * The client holds these to draw panels and to grey out rows in the records tab. It never rolls a
 * catch: the server does, and `FishSighted` deliberately does not say which species is passing, or a
 * client could ignore the cheap ones and only ever cast on the rare.
 *
 * Weights are integers in the system's fixed-point unit; there are no fractional values on this wire.
 */
export class FishSpeciesDefinition
{
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public constructor(
        public readonly id: number,
        /** Localisation key, not a display string — names ship with content, not with balance (§6). */
        public readonly nameKey: string,
        /** Which zone this species belongs to. */
        public readonly zoneId: number,
        /** Below this fishing level the species is not in the zone's table at all (§2.3). */
        public readonly requiredLevel: number,
        /** 1–5, for display only. The number that actually matters is `catchRate`. */
        public readonly rarityStars: number,
        /** Tenths of a percent, so 850 is 85 %. bobba.me spans roughly 25–85 %. */
        public readonly catchRate: number,
        /** Relative weight when the server picks which species swims past. */
        public readonly rarityWeight: number,
        public readonly minWeight: number,
        public readonly maxWeight: number,
        public readonly xpReward: number,
        /** Extra XP when the sighting was a golden one (§9). */
        public readonly goldenXpBonus: number,
        public readonly currencyReward: number,
        /** 24-bit mask, bit `h` set means available during hour `h` UTC — nocturnal species. */
        public readonly activeHours: number,
        /** 7-bit mask, bit 0 is Sunday. Origins gates species by weekday as well as by hour. */
        public readonly activeWeekdays: number,
        /**
         * `FishingSeason` mask — the fourth axis, alongside hour, weekday and zone.
         *
         * Origins' guides name "seasonal events" as an availability axis; **how it encodes one is
         * unknown**. See `docs/vortex-original/fishing.md` §11.
         */
        public readonly activeSeasons: number
    )
    {
    }

    /**
     * Whether the species is in season at a given UTC moment.
     *
     * The client uses this only to grey a row out in the records tab. The server applies the same
     * test when it builds a zone's table, and it is the server's answer that decides what appears.
     *
     * The season is passed in rather than derived from the date: a hotel may run a seasonal event
     * out of step with the calendar, and only the server knows which season it is currently
     * declaring.
     */
    // TS-only: Vortex-only — the client greys a row out with it; the server decides what appears.
    public isActiveAt(date: Date, season: number): boolean
    {
        const hourSet = (this.activeHours & (1 << date.getUTCHours())) !== 0;
        const daySet = (this.activeWeekdays & (1 << date.getUTCDay())) !== 0;
        const seasonSet = (this.activeSeasons & season) !== 0;

        return hourSet && daySet && seasonSet;
    }
}
