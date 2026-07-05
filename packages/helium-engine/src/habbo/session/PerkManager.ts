import type {IPerkManager, PerkAllowance} from './IPerkManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {SessionDataManager} from './SessionDataManager';
import {PerkAllowancesMessageEvent} from '@habbo/communication/messages/incoming/perk';
import {PerksUpdatedEvent} from './events/PerksUpdatedEvent';

/**
 * Perk manager
 * Based on AS3 com.sulake.habbo.session.PerkManager
 */
export class PerkManager implements IPerkManager
{
    private _ready: boolean = false;
    private _sessionDataManager: SessionDataManager | null = null;
    private _perkAllowancesMessageEvent: IMessageEvent | null = null;
    private _perks: Map<string, PerkAllowance> | null = new Map();

    constructor(sessionDataManager: SessionDataManager)
    {
        this._sessionDataManager = sessionDataManager;

        if(this._sessionDataManager.communication)
        {
            this._perkAllowancesMessageEvent = this._sessionDataManager.communication.addMessageEvent(
                new PerkAllowancesMessageEvent(this.onPerkAllowances.bind(this))
            );
        }
    }

    get isReady(): boolean
    {
        return this._ready;
    }

    get disposed(): boolean
    {
        return this._sessionDataManager === null;
    }

    isPerkAllowed(perkCode: string): boolean
    {
        const perk = this._perks?.get(perkCode) ?? null;

        return perk !== null && perk.isAllowed;
    }

    getPerkErrorMessage(perkCode: string): string
    {
        const perk = this._perks?.get(perkCode) ?? null;

        return perk !== null ? perk.errorMessage : '';
    }

    private onPerkAllowances(event: IMessageEvent): void
    {
        const parser = (event as PerkAllowancesMessageEvent).getParser();

        for(const perk of parser.getPerks())
        {
            this._perks?.set(perk.code, perk);
        }

        this._ready = true;
        this._sessionDataManager?.events.emit(PerksUpdatedEvent.PERKS_UPDATED, new PerksUpdatedEvent());
    }

    dispose(): void
    {
        if(this.disposed) return;

        if(this._perks)
        {
            this._perks.clear();
            this._perks = null;
        }

        if(this._sessionDataManager?.communication && this._perkAllowancesMessageEvent)
        {
            this._sessionDataManager.communication.removeMessageEvent(this._perkAllowancesMessageEvent);
        }

        this._perkAllowancesMessageEvent = null;
        this._sessionDataManager = null;
    }
}
