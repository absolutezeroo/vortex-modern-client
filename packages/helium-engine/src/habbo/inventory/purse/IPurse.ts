/**
 * Interface for Purse
 */
export interface IPurse
{
	clubDays: number;
	clubPeriods: number;
	clubPastPeriods: number;
    clubHasEverBeenMember: boolean;
    isVIP: boolean;
	minutesUntilExpiration: number;
	clubIsExpiring: boolean;
	citizenshipVipIsExpiring: boolean;
	minutesSinceLastModified: number;

	readonly hasClub: boolean;
	readonly totalClubDays: number;
}
