/**
 * User purse/wallet data (HC/VIP subscription info)
 *
 * Based on AS3 com.sulake.habbo.inventory.purse.Purse
 */
export class Purse
{
    private _lastUpdateTime: number = 0;

    constructor()
    {
        this._lastUpdateTime = Date.now();
    }

    private _clubDays: number = 0;

    get clubDays(): number
    {
        return this._clubDays;
    }

    set clubDays(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubDays = Math.max(0, value);
    }

    private _clubPeriods: number = 0;

    get clubPeriods(): number
    {
        return this._clubPeriods;
    }

    set clubPeriods(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubPeriods = Math.max(0, value);
    }

    private _clubPastPeriods: number = 0;

    get clubPastPeriods(): number
    {
        return this._clubPastPeriods;
    }

    set clubPastPeriods(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubPastPeriods = Math.max(0, value);
    }

    private _clubHasEverBeenMember: boolean = false;

    get clubHasEverBeenMember(): boolean
    {
        return this._clubHasEverBeenMember;
    }

    set clubHasEverBeenMember(value: boolean)
    {
        this._lastUpdateTime = Date.now();
        this._clubHasEverBeenMember = value;
    }

    private _isVIP: boolean = false;

    get isVIP(): boolean
    {
        return this._isVIP;
    }

    set isVIP(value: boolean)
    {
        this._lastUpdateTime = Date.now();
        this._isVIP = value;
    }

    private _minutesUntilExpiration: number = 0;

    /**
	 * Get minutes until expiration
	 * Calculates remaining time based on last update
	 */
    get minutesUntilExpiration(): number
    {
        const elapsedMinutes = Math.floor((Date.now() - this._lastUpdateTime) / 60000);
        const remaining = this._minutesUntilExpiration - elapsedMinutes;

        return Math.max(0, remaining);
    }

    set minutesUntilExpiration(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._minutesUntilExpiration = value;
    }

    private _clubIsExpiring: boolean = false;

    get clubIsExpiring(): boolean
    {
        return this._clubIsExpiring;
    }

    set clubIsExpiring(value: boolean)
    {
        this._clubIsExpiring = value;
    }

    private _citizenshipVipIsExpiring: boolean = false;

    get citizenshipVipIsExpiring(): boolean
    {
        return this._citizenshipVipIsExpiring;
    }

    set citizenshipVipIsExpiring(value: boolean)
    {
        this._citizenshipVipIsExpiring = value;
    }

    private _minutesSinceLastModified: number = -1;

    get minutesSinceLastModified(): number
    {
        return this._minutesSinceLastModified;
    }

    set minutesSinceLastModified(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._minutesSinceLastModified = value;
    }

    /**
	 * Check if user has active club subscription
	 */
    get hasClub(): boolean
    {
        return this._clubDays > 0 || this._clubPeriods > 0;
    }

    /**
	 * Get total club days (current period + remaining)
	 */
    get totalClubDays(): number
    {
        return this._clubDays + (this._clubPeriods * 31);
    }
}
