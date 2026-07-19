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
    private _isExpiring: boolean = false;
    private _minutesUntilExpiration: number = 0;
    private _minutesSinceLastModified: number = 0;
    private _lastUpdated: number = Date.now();
    private _emeraldBalance: number = 0;
    private _silverBalance: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purse/Purse.as::get lastUpdated()
    get lastUpdated(): number { return this._lastUpdated; }

    get credits(): number { return this._credits; }

    set credits(value: number)
    {
        this._lastUpdated = Date.now();
        this._credits = value;
    }

    get silverBalance(): number { return this._silverBalance; }

    set silverBalance(value: number)
    {
        this._silverBalance = value;
    }

    get emeraldBalance(): number { return this._emeraldBalance; }

    set emeraldBalance(value: number)
    {
        this._emeraldBalance = value;
    }

    get clubDays(): number { return this._clubDays; }

    set clubDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._clubDays = value;
    }

    get clubPeriods(): number { return this._clubPeriods; }

    set clubPeriods(value: number)
    {
        this._lastUpdated = Date.now();
        this._clubPeriods = value;
    }

    get hasClubLeft(): boolean
    {
        return this._clubDays > 0 || this._clubPeriods > 0;
    }

    get isVIP(): boolean { return this._isVIP; }

    set isVIP(value: boolean)
    {
        this._isVIP = value;
    }

    get isExpiring(): boolean { return this._isExpiring; }

    set isExpiring(value: boolean)
    {
        this._isExpiring = value;
    }

    get pastClubDays(): number { return this._pastClubDays; }

    set pastClubDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._pastClubDays = value;
    }

    get pastVipDays(): number { return this._pastVipDays; }

    set pastVipDays(value: number)
    {
        this._lastUpdated = Date.now();
        this._pastVipDays = value;
    }

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

    getActivityPointsForType(type: number): number
    {
        return this._activityPoints.get(type) ?? 0;
    }

    set minutesUntilExpiration(value: number)
    {
        this._lastUpdated = Date.now();
        this._minutesUntilExpiration = value;
    }

    get minutesUntilExpiration(): number
    {
        const elapsedMinutes = Math.floor((Date.now() - this._lastUpdated) / 60000);
        const remaining = this._minutesUntilExpiration - elapsedMinutes;

        return remaining > 0 ? remaining : 0;
    }

    set minutesSinceLastModified(value: number)
    {
        this._lastUpdated = Date.now();
        this._minutesSinceLastModified = value;
    }

    get minutesSinceLastModified(): number
    {
        return this._minutesSinceLastModified;
    }
}
