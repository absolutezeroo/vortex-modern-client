/**
 * Trading state constants
 *
 * Based on AS3 com.sulake.habbo.inventory.trading.TradingModel states
 */
export const TradingState = {
	READY: 0,
	RUNNING: 1,
	COUNTDOWN: 2,
	CONFIRMING: 3,
	CONFIRMED: 4,
	COMPLETED: 5,
	CANCELLED: 6,
} as const;

export type TradingStateType = typeof TradingState[keyof typeof TradingState];

export const MAX_ITEMS_TO_TRADE = 9;
