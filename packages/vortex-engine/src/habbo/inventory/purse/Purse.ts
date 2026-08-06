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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/Purse.as::_clubDays
    private _clubDays: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubDays()
    get clubDays(): number
    {
        return this._clubDays;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set clubDays()
    set clubDays(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubDays = Math.max(0, value);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/Purse.as::_clubPeriods
    private _clubPeriods: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubPeriods()
    get clubPeriods(): number
    {
        return this._clubPeriods;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set clubPeriods()
    set clubPeriods(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubPeriods = Math.max(0, value);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/purse/Purse.as::_clubPastPeriods
    private _clubPastPeriods: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::get clubPastPeriods()
    get clubPastPeriods(): number
    {
        return this._clubPastPeriods;
    }

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::set clubPastPeriods()
    set clubPastPeriods(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._clubPastPeriods = Math.max(0, value);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/inventory/purse/Purse.as::_clubHasEverBeenMember
    private _clubHasEverBeenMember: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::get clubHasEverBeenMember()
    get clubHasEverBeenMember(): boolean
    {
        return this._clubHasEverBeenMember;
    }

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::set clubHasEverBeenMember()
    set clubHasEverBeenMember(value: boolean)
    {
        this._lastUpdateTime = Date.now();
        this._clubHasEverBeenMember = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/Purse.as::_isVIP
    private _isVIP: boolean = false;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get isVIP()
    get isVIP(): boolean
    {
        return this._isVIP;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set isVIP()
    set isVIP(value: boolean)
    {
        this._lastUpdateTime = Date.now();
        this._isVIP = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/Purse.as::_minutesUntilExpiration
    private _minutesUntilExpiration: number = 0;

    /**
	 * Get minutes until expiration
	 * Calculates remaining time based on last update
	 */
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesUntilExpiration()
    get minutesUntilExpiration(): number
    {
        const elapsedMinutes = Math.floor((Date.now() - this._lastUpdateTime) / 60000);
        const remaining = this._minutesUntilExpiration - elapsedMinutes;

        return Math.max(0, remaining);
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set minutesUntilExpiration()
    set minutesUntilExpiration(value: number)
    {
        this._lastUpdateTime = Date.now();
        this._minutesUntilExpiration = value;
    }

    private _clubIsExpiring: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::get clubIsExpiring()
    get clubIsExpiring(): boolean
    {
        return this._clubIsExpiring;
    }

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::set clubIsExpiring()
    set clubIsExpiring(value: boolean)
    {
        this._clubIsExpiring = value;
    }

    private _citizenshipVipIsExpiring: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::get citizenshipVipIsExpiring()
    get citizenshipVipIsExpiring(): boolean
    {
        return this._citizenshipVipIsExpiring;
    }

    // AS3: .../src/com/sulake/habbo/inventory/purse/Purse.as::set citizenshipVipIsExpiring()
    set citizenshipVipIsExpiring(value: boolean)
    {
        this._citizenshipVipIsExpiring = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/Purse.as::_minutesSinceLastModified
    private _minutesSinceLastModified: number = -1;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesSinceLastModified()
    get minutesSinceLastModified(): number
    {
        return this._minutesSinceLastModified;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set minutesSinceLastModified()
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
