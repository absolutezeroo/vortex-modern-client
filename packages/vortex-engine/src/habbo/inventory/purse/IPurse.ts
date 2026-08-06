/**
 * Interface for Purse
 */
export interface IPurse
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/IPurse.as::get clubDays()
    clubDays: number;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/IPurse.as::get clubPeriods()
    clubPeriods: number;
    clubPastPeriods: number;
    clubHasEverBeenMember: boolean;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/IPurse.as::get isVIP()
    isVIP: boolean;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/catalog/purse/IPurse.as::get minutesUntilExpiration()
    minutesUntilExpiration: number;
    clubIsExpiring: boolean;
    citizenshipVipIsExpiring: boolean;
    minutesSinceLastModified: number;

    readonly hasClub: boolean;
    readonly totalClubDays: number;
}
