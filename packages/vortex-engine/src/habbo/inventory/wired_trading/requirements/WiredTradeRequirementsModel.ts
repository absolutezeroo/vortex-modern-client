import type {IDisposable} from '@core/runtime/IDisposable';
import {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import type {GroupItem} from '@habbo/inventory/items/GroupItem';
import type {WiredTradingModel} from '../WiredTradingModel';
import type {IWiredTradeRequirementsView} from './IWiredTradeRequirementsView';
import {TradeRequirementWrapper} from './TradeRequirementWrapper';
import {WiredTradeRequirementsViewStub} from './WiredTradeRequirementsViewStub';

/**
 * Owns the contract behind a wired trade and answers the one question the furni grid asks of it:
 * may this stack be offered?
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/WiredTradeRequirementsModel.as
 */
export class WiredTradeRequirementsModel implements IDisposable
{
    // AS3: WiredTradeRequirementsModel.as::_SafeStr_4561 (from `get tradingModel()`)
    private _tradingModel: WiredTradingModel | null;

    // AS3: WiredTradeRequirementsModel.as::_SafeStr_4550 (from `get view()`)
    private _view: IWiredTradeRequirementsView | null;

    // AS3: WiredTradeRequirementsModel.as::_SafeStr_5380 (the parsed contract, from `get requirement()`)
    private _wrapper: TradeRequirementWrapper | null = null;

    // AS3: WiredTradeRequirementsModel.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTradeRequirementsModel.as::WiredTradeRequirementsModel()
    constructor(tradingModel: WiredTradingModel)
    {
        this._tradingModel = tradingModel;
        this._view = new WiredTradeRequirementsViewStub();
    }

    // AS3: WiredTradeRequirementsModel.as::get tradingModel()
    get tradingModel(): WiredTradingModel | null
    {
        return this._tradingModel;
    }

    // AS3: WiredTradeRequirementsModel.as::setRequirements()
    setRequirements(requirement: TradeRequirement, showImmediate: boolean): void
    {
        this._wrapper = new TradeRequirementWrapper(requirement);

        this._view?.requirementsUpdated(requirement, showImmediate);
    }

    // AS3: WiredTradeRequirementsModel.as::requirementsStateUpdated()
    requirementsStateUpdated(): void
    {
        this._view?.requirementsStateUpdated();
    }

    // AS3: WiredTradeRequirementsModel.as::highlightRefresh()
    highlightRefresh(): void
    {
        this._view?.highlightRefresh();
    }

    /**
     * AS3 dereferences the wrapper here with no null check, so a caller reaching this before
     * `setRequirements()` throws there and returns null here. The port answers null rather than
     * throwing, which is the same thing every caller already handles — `WiredTradingModel`'s two
     * consumers both test for it.
     */
    // AS3: WiredTradeRequirementsModel.as::get requirement()
    get requirement(): TradeRequirement | null
    {
        return this._wrapper?.requirements ?? null;
    }

    /**
     * Whether a stack may go into this trade. The four contract types are what give the otherwise
     * unnamed `TradeRequirement` constants their meaning — credit furniture is `CF_`-prefixed, and
     * two of the types exist purely to include or exclude it.
     *
     * A contract that has not arrived yet permits everything; a stack with nothing tradeable in it
     * permits nothing. Both of those precede the type test, so they hold for every contract.
     */
    // AS3: WiredTradeRequirementsModel.as::canOfferFurni()
    canOfferFurni(groupItem: GroupItem): boolean
    {
        if(this._wrapper == null) return true;

        if(groupItem.getTradeableCount(false) === 0) return false;

        switch(this._wrapper.type)
        {
            case TradeRequirement.TYPE_ANY_FURNI:
                return true;
            case TradeRequirement.TYPE_NORMAL_FURNI_ONLY:
                return groupItem.className.indexOf('CF_') !== 0;
            case TradeRequirement.TYPE_CREDIT_FURNI_ONLY:
                return groupItem.className.indexOf('CF_') === 0;
            case TradeRequirement.TYPE_CUSTOM:
                return groupItem.className.indexOf('CF_') === 0
                    ? this._wrapper.canOfferCreditFurni()
                    : this._wrapper.canOfferNormalFurni(groupItem);
            default:
                // AS3 falls out of its if-chain to `true` for any type it does not recognise.
                return true;
        }
    }

    // AS3: WiredTradeRequirementsModel.as::get view()
    get view(): IWiredTradeRequirementsView | null
    {
        return this._view;
    }

    // AS3: WiredTradeRequirementsModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredTradeRequirementsModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._view?.dispose();
        this._view = null;
        this._tradingModel = null;
        this._wrapper = null;
        this._disposed = true;
    }
}
