import type {IDisposable} from '@core/runtime/IDisposable';
import type {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';

/**
 * The three calls `WiredTradeRequirementsModel` makes into its view, plus disposal.
 *
 * AS3 declares no such interface — the model holds a concrete `WiredTradeRequirementsView`. It was
 * introduced so the model could be ported and reviewed against the source while the view was still
 * a stub, and is kept because the model reads better against three named calls than against a
 * 400-line class.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/WiredTradeRequirementsView.as
 */
export interface IWiredTradeRequirementsView extends IDisposable
{
    // AS3: .../requirements/WiredTradeRequirementsView.as::requirementsUpdated()
    requirementsUpdated(requirement: TradeRequirement, showImmediate: boolean): void;

    // AS3: .../requirements/WiredTradeRequirementsView.as::requirementsStateUpdated()
    requirementsStateUpdated(): void;

    // AS3: .../requirements/WiredTradeRequirementsView.as::highlightRefresh()
    highlightRefresh(): void;
}
