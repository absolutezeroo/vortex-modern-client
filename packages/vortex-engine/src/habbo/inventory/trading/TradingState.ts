/**
 * The seven trade states, and the per-side item cap.
 *
 * AS3 declares all eight as public statics **on `TradingModel` itself**. They live in their own
 * module here for the same reason `MyReportStatusColumn` does: `TradingModel` is the only thing
 * that would import them back, and every consumer of the state wants the constants without
 * dragging in the model. The `TRADING_STATE_` prefix is dropped because the object already
 * namespaces them — `TradingState.READY` reads as `TRADING_STATE_READY` does, and the trace on
 * each member names the AS3 constant it came from.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as
 */
export const TradingState = {
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_READY
    READY: 0,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_RUNNING
    RUNNING: 1,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_COUNTDOWN
    COUNTDOWN: 2,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_CONFIRMING
    CONFIRMING: 3,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_CONFIRMED
    CONFIRMED: 4,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_COMPLETED
    COMPLETED: 5,

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::TRADING_STATE_CANCELLED
    CANCELLED: 6,
} as const;

export type TradingStateType = typeof TradingState[keyof typeof TradingState];

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/TradingModel.as::MAX_ITEMS_TO_TRADE
export const MAX_ITEMS_TO_TRADE = 9;
