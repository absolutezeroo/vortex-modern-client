import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A cast landed. The first and only time the species is named.
 *
 * NOT ported from AS3 — Vortex-only system. Header 8108.
 *
 * Everything here is already decided: the server rolled the species, the weight, the catch rate and
 * the rewards before this was written. The client displays it and files the record id, which is what
 * `MountCatch` later refers to.
 *
 * `newLevel` is zero when the catch did not level the player up — the caller shows the level-up
 * flourish only when it is not.
 *
 * A `FishingPlayerState` push follows, carrying the new totals; this message deliberately does not
 * restate them, so there is one place a level or a balance can come from.
 *
 * See `docs/vortex-original/fishing.md` §4 and §5.
 */
export class VortexFishingCatchResultMessageParser implements IMessageParser
{
    // TS-only: what `MountCatch` names to mint a trophy from this catch.
    private _recordId: number = 0;

    // TS-only: resolved against `FishingDefinitions.getSpecies()`.
    private _speciesId: number = 0;

    // TS-only: rolled per catch between the species' bounds. This is what the derby scores.
    private _weight: number = 0;

    // TS-only: already multiplied by the rod tier, so it is what to show.
    private _xpGained: number = 0;

    // TS-only: already multiplied and already capped by the daily limit and session decay.
    private _currencyGained: number = 0;

    // TS-only: whether the sighting behind it was golden.
    private _golden: boolean = false;

    // TS-only: zero when the catch did not level the player up.
    private _newLevel: number = 0;

    // TS-only: Vortex-only accessor.
    get recordId(): number
    {
        return this._recordId;
    }

    // TS-only: Vortex-only accessor.
    get speciesId(): number
    {
        return this._speciesId;
    }

    // TS-only: Vortex-only accessor.
    get weight(): number
    {
        return this._weight;
    }

    // TS-only: Vortex-only accessor.
    get xpGained(): number
    {
        return this._xpGained;
    }

    // TS-only: Vortex-only accessor.
    get currencyGained(): number
    {
        return this._currencyGained;
    }

    // TS-only: Vortex-only accessor.
    get golden(): boolean
    {
        return this._golden;
    }

    // TS-only: Vortex-only accessor.
    get newLevel(): number
    {
        return this._newLevel;
    }

    // TS-only: Vortex-only convenience — the level-up flourish gates on this.
    get leveledUp(): boolean
    {
        return this._newLevel > 0;
    }

    // TS-only: `IMessageParser` contract.
    flush(): boolean
    {
        this._recordId = 0;
        this._speciesId = 0;
        this._weight = 0;
        this._xpGained = 0;
        this._currencyGained = 0;
        this._golden = false;
        this._newLevel = 0;

        return true;
    }

    // TS-only: `IMessageParser` contract. Read order is the wire contract — append-only.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._recordId = wrapper.readInt();
        this._speciesId = wrapper.readInt();
        this._weight = wrapper.readInt();
        this._xpGained = wrapper.readInt();
        this._currencyGained = wrapper.readInt();
        this._golden = wrapper.readBoolean();
        this._newLevel = wrapper.readInt();

        return true;
    }
}
