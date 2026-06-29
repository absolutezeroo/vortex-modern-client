/**
 * Club membership level constants
 * Based on AS3 com.sulake.habbo.session.HabboClubLevelEnum
 */
export const HabboClubLevelEnum = {
	NO_CLUB: 0,
	CLUB: 1,
	VIP: 2,
} as const;

export type HabboClubLevel = typeof HabboClubLevelEnum[keyof typeof HabboClubLevelEnum];

export function hasClub(level: number): boolean
{
	return level >= HabboClubLevelEnum.CLUB;
}

export function hasVip(level: number): boolean
{
	return level >= HabboClubLevelEnum.VIP;
}
