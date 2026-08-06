import type {IHabboCatalogPurse} from './IHabboCatalogPurse';

/**
 * Catalog purse/wallet data.
 *
 * @see sources/win63_version/habbo/catalog/purse/Purse.as
 */
export class Purse implements IHabboCatalogPurse
{
    private _credits: number = 0;
    private _activityPoints: Map<number, number> = new Map();
    private _clubDays: number = 0;
    private _clubPeriods: number = 0;
    private _isVIP: boolean = false;
    private _pastClubDays: number = 0;
    private _pastVipDays: number = 0;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::_isExpiring
    private _isExpiring: boolean = false;
    private _minutesUntilExpiration: number = 0;
    private _minutesSinceLastModified: number = 0;
    private _lastUpdated: number = Date.now();
    private _emeraldBalance: number = 0;
    private _silverBalance: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purse/Purse.as::get lastUpdated()
    get lastUpdated(): number { return this._lastUpdated; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get credits()
    get credits(): number { return this._credits; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set credits()
    set credits(value: number)
    {
        this._lastUpdated = Date.now();
        this._credits = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get silverBalance()
    get silverBalance(): number { return this._silverBalance; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set silverBalance()
    set silverBalance(value: number)
    {
        this._silverBalance = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get emeraldBalance()
    get emeraldBalance(): number { return this._emeraldBalance; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set emeraldBalance()
    set emeraldBalance(value: number)
    {
        this._emeraldBalance = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubDays()
    get clubDays(): number { return this._clubDays; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set clubDays()
    set clubDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._clubDays = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubPeriods()
    get clubPeriods(): number { return this._clubPeriods; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set clubPeriods()
    set clubPeriods(value: number)
    {
        this._lastUpdated = Date.now();
        this._clubPeriods = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get hasClubLeft()
    get hasClubLeft(): boolean
    {
        return this._clubDays > 0 || this._clubPeriods > 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get isVIP()
    get isVIP(): boolean { return this._isVIP; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set isVIP()
    set isVIP(value: boolean)
    {
        this._isVIP = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get isExpiring()
    get isExpiring(): boolean { return this._isExpiring; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set isExpiring()
    set isExpiring(value: boolean)
    {
        this._isExpiring = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get pastClubDays()
    get pastClubDays(): number { return this._pastClubDays; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set pastClubDays()
    set pastClubDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._pastClubDays = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get pastVipDays()
    get pastVipDays(): number { return this._pastVipDays; }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set pastVipDays()
    set pastVipDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._pastVipDays = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get activityPoints()
    get activityPoints(): Map<number, number>
    {
        return this._activityPoints;
    }

    setActivityPoints(points: Map<number, number>): void
    {
        this._lastUpdated = Date.now();
        this._activityPoints.clear();

        for(const [type, amount] of points)
        {
            this._activityPoints.set(type, amount);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::getActivityPointsForType()
    getActivityPointsForType(type: number): number
    {
        return this._activityPoints.get(type) ?? 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set minutesUntilExpiration()
    set minutesUntilExpiration(value: number)
    {
        this._lastUpdated = Date.now();
        this._minutesUntilExpiration = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesUntilExpiration()
    get minutesUntilExpiration(): number
    {
        const elapsedMinutes = Math.floor((Date.now() - this._lastUpdated) / 60000);
        const remaining = this._minutesUntilExpiration - elapsedMinutes;

        return remaining > 0 ? remaining : 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::set minutesSinceLastModified()
    set minutesSinceLastModified(value: number)
    {
        this._lastUpdated = Date.now();
        this._minutesSinceLastModified = value;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesSinceLastModified()
    get minutesSinceLastModified(): number
    {
        return this._minutesSinceLastModified;
    }
}
