import {Logger} from '@core/utils/Logger';
import type {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import type {IWiredTradeRequirementsView} from './IWiredTradeRequirementsView';

const log = Logger.getLogger('habbo.inventory.wired_trading.requirements.WiredTradeRequirementsView');

/**
 * Stands in for `WiredTradeRequirementsView` (418 lines) until it is ported.
 *
 * TODO(AS3): port sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/WiredTradeRequirementsView.as
 * and its three sub-views under `requirements/offerings/` (OfferingRequirementsView 311,
 * OfferingRuleView 219, OfferingNodeView 133, ChestItemTypeRenderableWrapper 54), then delete this
 * file. The model above it is complete and faithful; nothing here is.
 *
 * Every method warns rather than staying silent. A wired trade that reaches this class is a trade
 * the player is being asked to accept without being shown its terms, which is the one outcome that
 * must not happen quietly — and `warn` is the level this project reserves for a code path it does
 * not handle.
 */
export class WiredTradeRequirementsViewStub implements IWiredTradeRequirementsView
{
    // TS-only: the stub tracks only whether it was disposed; the real view has no such field.
    private _disposed: boolean = false;

    /**
	 * Whether the last contract had terms worth showing.
	 *
	 * A payment-only contract — every chest deposit is one — has no "you give" rules and no "you
	 * get" side, so the panel this stub replaces would draw nothing anyway. Warning about it on
	 * every deposit taught the log to be ignored, which is the one thing that must not happen to
	 * the case below it.
	 */
    // TS-only: the real view needs no such flag; it simply draws what it is given.
    private _hidesTerms: boolean = false;

    // TS-only: the stub's own state; the real view tracks far more.
    get disposed(): boolean
    {
        return this._disposed;
    }

    // TODO(AS3): builds the requirements panel from the contract and opens it when showImmediate.
    requirementsUpdated(requirement: TradeRequirement, showImmediate: boolean): void
    {
        this._hidesTerms = !requirement.isPaymentOnly();

        if(!this._hidesTerms) return;

        log.warn(
            'WiredTradeRequirementsView is not ported: the contract terms cannot be shown '
            + `(type ${requirement.type}, layout "${requirement.layoutType}", showImmediate ${showImmediate}).`
        );
    }

    // TODO(AS3): repaints each rule row as the offered items change.
    requirementsStateUpdated(): void
    {
        if(!this._hidesTerms) return;

        log.warn('WiredTradeRequirementsView is not ported: the requirements panel cannot refresh.');
    }

    // TODO(AS3): re-runs the "this item satisfies that rule" highlighting.
    highlightRefresh(): void
    {
        if(!this._hidesTerms) return;

        log.warn('WiredTradeRequirementsView is not ported: rule highlighting is unavailable.');
    }

    // TS-only: satisfies IDisposable while the real view is unported.
    dispose(): void
    {
        this._disposed = true;
    }
}
