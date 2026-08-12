import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWiredTradingView} from './IWiredTradingView';

const log = Logger.getLogger('habbo.inventory.wired_trading.WiredTradingView');

/**
 * Stands in for `WiredTradingView` (447 lines) until it is ported.
 *
 * TODO(AS3): port sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/WiredTradingView.as
 * and delete this file. The model above it is complete and faithful; nothing here is.
 *
 * `getWindowContainer()` returning null is the load-bearing part: `HabboInventory` resolves the
 * wired-trading sub-page through it, so the tab has no contents and the model's own state machine
 * runs headless. Everything else warns — a trade the player cannot see is not a trade they can
 * refuse, and this project reserves `warn` for exactly this: a real code path the client does not
 * handle, which would otherwise render nothing and throw nothing.
 */
export class WiredTradingViewStub implements IWiredTradingView
{
    // TS-only: the stub tracks only whether it was disposed; the real view has no such field.
    private _disposed: boolean = false;

    // TS-only: the stub's own state; the real view tracks the windows and the countdown timer.
    get disposed(): boolean
    {
        return this._disposed;
    }

    // TODO(AS3): builds `wired_trading` from its layout and returns the container.
    getWindowContainer(): IWindowContainer | null
    {
        return null;
    }

    // TODO(AS3): repaints both offers, the item counts and the accept button.
    updateAllUI(): void
    {
        log.warn('WiredTradingView is not ported: the wired-trading offer cannot be shown.');
    }

    // TODO(AS3): swaps the button row for the current trade state.
    tradeStateUpdated(): void
    {
        log.warn('WiredTradingView is not ported: the trade-state buttons are unavailable.');
    }

    // TODO(AS3): starts the one-second tick that drives the countdown label.
    startSecondsLeftTimer(): void
    {
        log.warn('WiredTradingView is not ported: the trade countdown is not displayed.');
    }

    // TODO(AS3): stops that tick.
    stopSecondsLeftTimer(): void
    {
    }

    // TODO(AS3): shows the localized cancellation reason for this failure type.
    alertTradeCancelled(transactionFailureTypeId: number): void
    {
        log.warn(`WiredTradingView is not ported: trade cancelled (failure type ${transactionFailureTypeId}) with no notice to the player.`);
    }

    // TS-only: satisfies IDisposable while the real view is unported.
    dispose(): void
    {
        this._disposed = true;
    }
}
