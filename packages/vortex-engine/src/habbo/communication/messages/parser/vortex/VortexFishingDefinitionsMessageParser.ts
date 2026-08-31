import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

import {FishSpeciesDefinition} from '@habbo/vortex/fishing/definitions/FishSpeciesDefinition';
import {FishingLevelDefinition} from '@habbo/vortex/fishing/definitions/FishingLevelDefinition';
import {FishingZoneDefinition} from '@habbo/vortex/fishing/definitions/FishingZoneDefinition';
import {RodLevelDefinition} from '@habbo/vortex/fishing/definitions/RodLevelDefinition';

/**
 * Every fishing definition table, in one message.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. Header 8102. See `docs/vortex-original/fishing.md` §6.
 *
 * **Re-sendable at any time.** This is not a login-only fetch: an operator editing a balance value
 * makes the server bump `version` and broadcast this to every connected session, and
 * `FishingDefinitions.apply()` uses the version to ignore a redundant push. That is the entire
 * reason the tables travel as a packet instead of as a gamedata file.
 *
 * The read order below is the wire contract with the emulator's
 * `VortexFishingDefinitionsMessageComposer`. Fields are **append-only**: a new one goes at the end of
 * its record, never in the middle, or every client older than the change reads the rest as noise.
 */
export class VortexFishingDefinitionsMessageParser implements IMessageParser
{
    // TS-only: the reload counter. `FishingDefinitions.apply()` drops a push that is not newer.
    private _version: number = 0;

    // TS-only: Vortex-only tables — no AS3 counterpart for any of the three.
    private _species: FishSpeciesDefinition[] = [];

    // TS-only: see `_species`.
    private _rodLevels: RodLevelDefinition[] = [];

    // TS-only: see `_species`. Separate curve from the rod's — Origins runs the two in parallel.
    private _fishingLevels: FishingLevelDefinition[] = [];

    // TS-only: see `_species`.
    private _zones: FishingZoneDefinition[] = [];

    // TS-only: read by the subscriber to decide whether this push changes anything.
    get version(): number
    {
        return this._version;
    }

    // TS-only: Vortex-only accessor — no AS3 counterpart.
    get species(): FishSpeciesDefinition[]
    {
        return this._species;
    }

    // TS-only: Vortex-only accessor — no AS3 counterpart.
    get rodLevels(): RodLevelDefinition[]
    {
        return this._rodLevels;
    }

    // TS-only: Vortex-only accessor — no AS3 counterpart.
    get fishingLevels(): FishingLevelDefinition[]
    {
        return this._fishingLevels;
    }

    // TS-only: Vortex-only accessor — no AS3 counterpart.
    get zones(): FishingZoneDefinition[]
    {
        return this._zones;
    }

    // TS-only: `IMessageParser` contract — resets every table before reuse.
    flush(): boolean
    {
        this._version = 0;
        this._species = [];
        this._rodLevels = [];
        this._fishingLevels = [];
        this._zones = [];

        return true;
    }

    // TS-only: `IMessageParser` contract. The read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._version = wrapper.readInt();

        const speciesCount = wrapper.readInt();

        for(let i = 0; i < speciesCount; i++)
        {
            this._species.push(new FishSpeciesDefinition(
                wrapper.readInt(),      // id
                wrapper.readString(),   // nameKey
                wrapper.readInt(),      // zoneId
                wrapper.readInt(),      // requiredLevel
                wrapper.readInt(),      // rarityStars
                wrapper.readInt(),      // catchRate, tenths of a percent
                wrapper.readInt(),      // rarityWeight
                wrapper.readInt(),      // minWeight
                wrapper.readInt(),      // maxWeight
                wrapper.readInt(),      // xpReward
                wrapper.readInt(),      // goldenXpBonus
                wrapper.readInt(),      // currencyReward
                wrapper.readInt(),      // activeHours, 24-bit mask
                wrapper.readInt(),      // activeWeekdays, 7-bit mask
                wrapper.readInt()       // activeSeasons, FishingSeason mask
            ));
        }

        const rodLevelCount = wrapper.readInt();

        for(let i = 0; i < rodLevelCount; i++)
        {
            this._rodLevels.push(new RodLevelDefinition(
                wrapper.readInt(),      // quality tier
                wrapper.readInt(),      // xpThreshold, rod XP
                wrapper.readString(),   // nameKey
                wrapper.readInt(),      // handItemId
                wrapper.readInt(),      // catchMultiplier, thousandths
                wrapper.readInt(),      // goldenMultiplier, thousandths
                wrapper.readInt()       // hookHavocChance, tenths of a percent
            ));
        }

        const fishingLevelCount = wrapper.readInt();

        for(let i = 0; i < fishingLevelCount; i++)
        {
            this._fishingLevels.push(new FishingLevelDefinition(
                wrapper.readInt(),      // level
                wrapper.readInt()       // xpThreshold, fishing XP
            ));
        }

        const zoneCount = wrapper.readInt();

        for(let i = 0; i < zoneCount; i++)
        {
            this._zones.push(new FishingZoneDefinition(
                wrapper.readInt(),      // id
                wrapper.readString(),   // nameKey
                wrapper.readString(),   // furniClass
                wrapper.readInt(),      // requiredLevel
                wrapper.readInt(),      // minCatches before the spot runs dry
                wrapper.readInt()       // maxCatches
            ));
        }

        return true;
    }
}
