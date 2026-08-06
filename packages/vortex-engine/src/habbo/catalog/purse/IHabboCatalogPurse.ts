/**
 * Interface for the catalog purse.
 *
 * @see sources/win63_version/habbo/catalog/purse/class_1831.as
 */
export interface IHabboCatalogPurse
{
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get credits()
    credits: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get silverBalance()
    silverBalance: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get emeraldBalance()
    emeraldBalance: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubDays()
    clubDays: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get clubPeriods()
    clubPeriods: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get isExpiring()
    isExpiring: boolean;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get isVIP()
    isVIP: boolean;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get pastClubDays()
    pastClubDays: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get pastVipDays()
    pastVipDays: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesUntilExpiration()
    minutesUntilExpiration: number;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get minutesSinceLastModified()
    minutesSinceLastModified: number;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get hasClubLeft()
    readonly hasClubLeft: boolean;
    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::get activityPoints()
    readonly activityPoints: Map<number, number>;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purse/Purse.as::get lastUpdated()
    readonly lastUpdated: number;

    // AS3: .../src/com/sulake/habbo/catalog/purse/Purse.as::getActivityPointsForType()
    getActivityPointsForType(type: number): number;
    setActivityPoints(points: Map<number, number>): void;
}
