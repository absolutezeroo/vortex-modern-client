import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';

/**
 * The six calls `WiredTradingModel` makes into its view, plus disposal.
 *
 * AS3 declares no such interface — the model holds a concrete `WiredTradingView`. It exists here so
 * the model can be ported and reviewed against the source without the view's 447 lines being
 * written blind; see `WiredTradingViewStub` for what is standing in.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/WiredTradingView.as
 */
export interface IWiredTradingView extends IDisposable
{
    /** The inventory asks for this to host the wired-trading sub-page. */
    // AS3: .../wired_trading/WiredTradingView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null;

    // AS3: WiredTradingView.as::get requirementsButton()
    // The requirements bubble hangs off this button and positions itself beside it.
    readonly requirementsButton: IWindow | null;

    /** Repaints everything: both offers, the counts, the accept button. */
    // AS3: .../wired_trading/WiredTradingView.as::updateAllUI()
    updateAllUI(): void;

    /** The trade moved between ready / adding / countdown / confirming / confirmed. */
    // AS3: .../wired_trading/WiredTradingView.as::tradeStateUpdated()
    tradeStateUpdated(): void;

    // AS3: .../wired_trading/WiredTradingView.as::startSecondsLeftTimer()
    startSecondsLeftTimer(): void;

    // AS3: .../wired_trading/WiredTradingView.as::stopSecondsLeftTimer()
    stopSecondsLeftTimer(): void;

    /** Tells the player why the trade ended, by failure-type id. */
    // AS3: .../wired_trading/WiredTradingView.as::alertTradeCancelled()
    alertTradeCancelled(transactionFailureTypeId: number): void;
}
