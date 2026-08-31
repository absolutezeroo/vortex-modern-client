import EventEmitter from 'eventemitter3';

import type {FishSpeciesDefinition} from './definitions/FishSpeciesDefinition';
import type {FishingZoneDefinition} from './definitions/FishingZoneDefinition';
import type {FishingLevelDefinition} from './definitions/FishingLevelDefinition';
import type {RodLevelDefinition} from './definitions/RodLevelDefinition';

/** Emitted whenever a push actually replaced the tables. */
export const FISHING_DEFINITIONS_CHANGED = 'fishingDefinitionsChanged';

/**
 * Everything the client knows about fishing, and nothing it decides.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §6.
 *
 * **This is a push target, not a cache.** The whole reason the definitions arrive as a packet rather
 * than as a gamedata file is that a gamedata file is fetched once at boot and needs a page reload to
 * change. An operator editing a catch rate in the dashboard must reach a player already standing at
 * a pond, and `apply()` is where that lands.
 *
 * Anything displaying these values listens for {@link FISHING_DEFINITIONS_CHANGED} and rebuilds.
 */
export class FishingDefinitions extends EventEmitter
{
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    private _version: number = 0;

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    private _species: Map<number, FishSpeciesDefinition> = new Map();

    // TS-only: rod quality tiers, sorted by threshold. Separate from the fishing level below.
    private _rodLevels: RodLevelDefinition[] = [];

    // TS-only: the fishing level curve. Origins runs it in parallel with rod quality, not fused.
    private _fishingLevels: FishingLevelDefinition[] = [];

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    private _zones: Map<number, FishingZoneDefinition> = new Map();

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    private _zonesByFurniClass: Map<string, FishingZoneDefinition> = new Map();

    /** Zero until the first push. Nothing should draw a fishing panel before then. */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public get version(): number
    {
        return this._version;
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public get loaded(): boolean
    {
        return this._version > 0;
    }

    /**
     * Replaces every table and announces it — but only if the push is actually newer.
     *
     * The version test is what makes a redundant broadcast free: a server that re-pushes on every
     * reconnect must not make every open panel rebuild. It returns whether anything changed, so a
     * caller can tell the two apart.
     *
     * Rod levels are kept sorted by threshold and never keyed by level number: `levelForXp()` walks
     * them, and a gap in the numbering (bobba.me skips level 10) must not become a hole in a map.
     */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public apply(
        version: number,
        species: readonly FishSpeciesDefinition[],
        rodLevels: readonly RodLevelDefinition[],
        fishingLevels: readonly FishingLevelDefinition[],
        zones: readonly FishingZoneDefinition[]
    ): boolean
    {
        if(version <= this._version)
        {
            return false;
        }

        this._version = version;
        this._species = new Map(species.map((entry) => [entry.id, entry]));
        this._rodLevels = [...rodLevels].sort((a, b) => a.xpThreshold - b.xpThreshold);
        this._fishingLevels = [...fishingLevels].sort((a, b) => a.xpThreshold - b.xpThreshold);
        this._zones = new Map(zones.map((entry) => [entry.id, entry]));
        this._zonesByFurniClass = new Map(zones.map((entry) => [entry.furniClass, entry]));

        this.emit(FISHING_DEFINITIONS_CHANGED, this._version);

        return true;
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public getSpecies(id: number): FishSpeciesDefinition | null
    {
        return this._species.get(id) ?? null;
    }

    /**
     * Every species, in the order the server sent them.
     *
     * The records tab draws this whole list — including rows the player has never caught, greyed
     * out. That visible gap is the progression loop, so this must not be filtered down to what is
     * currently reachable.
     */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public get allSpecies(): FishSpeciesDefinition[]
    {
        return [...this._species.values()];
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public getSpeciesForZone(zoneId: number): FishSpeciesDefinition[]
    {
        return this.allSpecies.filter((entry) => entry.zoneId === zoneId);
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public getZone(id: number): FishingZoneDefinition | null
    {
        return this._zones.get(id) ?? null;
    }

    /** Keyed by furni class — every copy of a spot behaves the same (§2.3). */
    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public getZoneByFurniClass(furniClass: string): FishingZoneDefinition | null
    {
        return this._zonesByFurniClass.get(furniClass) ?? null;
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public get allZones(): FishingZoneDefinition[]
    {
        return [...this._zones.values()];
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public get allRodLevels(): RodLevelDefinition[]
    {
        return [...this._rodLevels];
    }

    /**
     * The rod quality tier a given cumulative **rod** XP has reached.
     *
     * Answers the highest tier whose threshold has been passed, so XP below the first threshold
     * still lands on the first tier rather than on nothing — a player at 0 XP holds a rod.
     *
     * Walked rather than keyed by tier number: a curve may skip numbers, and a map would leave holes.
     */
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public rodQualityForXp(xp: number): RodLevelDefinition | null
    {
        let reached: RodLevelDefinition | null = null;

        for(const tier of this._rodLevels)
        {
            if(tier.xpThreshold > xp) break;

            reached = tier;
        }

        return reached ?? this._rodLevels[0] ?? null;
    }

    /**
     * The fishing level a given cumulative **fishing** XP has reached — the one that unlocks zones.
     *
     * A separate curve from the rod's, and reading one for the other is the mistake this pair of
     * methods exists to prevent.
     */
    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public fishingLevelForXp(xp: number): FishingLevelDefinition | null
    {
        let reached: FishingLevelDefinition | null = null;

        for(const level of this._fishingLevels)
        {
            if(level.xpThreshold > xp) break;

            reached = level;
        }

        return reached ?? this._fishingLevels[0] ?? null;
    }

    // TS-only: Vortex reconstruction — no AS3 counterpart.
    public get allFishingLevels(): FishingLevelDefinition[]
    {
        return [...this._fishingLevels];
    }

    // TS-only: Vortex-only fishing system — no AS3 counterpart.
    public dispose(): void
    {
        this.removeAllListeners();
        this._species.clear();
        this._zones.clear();
        this._zonesByFurniClass.clear();
        this._rodLevels = [];
        this._fishingLevels = [];
        this._version = 0;
    }
}
