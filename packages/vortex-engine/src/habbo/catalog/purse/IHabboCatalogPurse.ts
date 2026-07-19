/**
 * Interface for the catalog purse.
 *
 * @see sources/win63_version/habbo/catalog/purse/class_1831.as
 */
export interface IHabboCatalogPurse
{
    credits: number;
    silverBalance: number;
    emeraldBalance: number;
    clubDays: number;
    clubPeriods: number;
    isExpiring: boolean;
    isVIP: boolean;
    pastClubDays: number;
    pastVipDays: number;
    minutesUntilExpiration: number;
    minutesSinceLastModified: number;

    readonly hasClubLeft: boolean;
    readonly activityPoints: Map<number, number>;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purse/Purse.as::get lastUpdated()
    readonly lastUpdated: number;

    getActivityPointsForType(type: number): number;
    setActivityPoints(points: Map<number, number>): void;
}
