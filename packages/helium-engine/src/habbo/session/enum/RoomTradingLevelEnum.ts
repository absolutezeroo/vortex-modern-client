/**
 * Room trading mode levels
 * Based on AS3 com.sulake.habbo.session.enum.RoomTradingLevelEnum
 */
export const RoomTradingLevelEnum = {
	NO_TRADING: 0,
	ROOM_CONTROLLER_REQUIRED: 1,
	FREE_TRADING: 2,
} as const;

export type RoomTradingLevel = typeof RoomTradingLevelEnum[keyof typeof RoomTradingLevelEnum];

export function getLocalizationKey(level: number): string
{
	switch (level)
	{
		case RoomTradingLevelEnum.NO_TRADING:
			return '${trading.mode.not.allowed}';
		case RoomTradingLevelEnum.ROOM_CONTROLLER_REQUIRED:
			return '${trading.mode.controller}';
		case RoomTradingLevelEnum.FREE_TRADING:
			return '${trading.mode.free}';
		default:
			return '';
	}
}
