import type {IDisposable} from '@core/runtime/IDisposable';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {TradeRequirementNode} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';

import type {WiredTradeRequirementsModel} from '../WiredTradeRequirementsModel';
import {ChestItemTypeRenderableWrapper} from './ChestItemTypeRenderableWrapper';
import type {OfferingRuleView} from './OfferingRuleView';

/**
 * One term of a contract: "3x this furni", or "50 coins".
 *
 * The window is a clone of a template the rule view hands over, and the view is pooled — hence the
 * split between `initialize()` and `recycle()`, which fill and empty it without touching the
 * window. Only `dispose()` gives the window back.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/offerings/OfferingNodeView.as
 */
export class OfferingNodeView implements IDisposable
{
    // AS3: OfferingNodeView.as::_disposed
    private _disposed: boolean = false;

    // AS3: OfferingNodeView.as::_SafeStr_5281 (from the initialize() parameter it is assigned from)
    private _requirementsModel: WiredTradeRequirementsModel | null = null;

    // AS3: OfferingNodeView.as::_SafeStr_6958 (the rule view that owns this node)
    private _ruleView: OfferingRuleView | null = null;

    // AS3: OfferingNodeView.as::_window
    private _window: IItemListWindow | null;

    // AS3: OfferingNodeView.as::_ruleNode
    private _ruleNode: TradeRequirementNode | null = null;

    // AS3: OfferingNodeView.as::_SafeStr_6665 (the node's place in its rule, from its only use)
    private _index: number = 0;

    // AS3: OfferingNodeView.as::OfferingNodeView()
    constructor(template: IItemListWindow)
    {
        this._window = template.clone() as IItemListWindow;
    }

    // AS3: OfferingNodeView.as::initialize()
    initialize(
        requirementsModel: WiredTradeRequirementsModel,
        ruleView: OfferingRuleView,
        ruleNode: TradeRequirementNode,
        index: number
    ): void
    {
        this._requirementsModel = requirementsModel;
        this._ruleView = ruleView;
        this._ruleNode = ruleNode;
        this._index = index;

        this.initializeUI();
    }

    /**
	 * Empties the view without giving up its window, so the pool can hand it out again.
	 */
    // AS3: OfferingNodeView.as::recycle()
    recycle(): void
    {
        this._requirementsModel = null;
        this._ruleView = null;
        this._ruleNode = null;
        this._index = 0;
    }

    /**
	 * The "and" only appears from the second term on, and the count only when there is more than
	 * one of something — a single item says its name with an icon and nothing else.
	 */
    // AS3: OfferingNodeView.as::initializeUI()
    private initializeUI(): void
    {
        const node = this._ruleNode;

        if(node === null) return;

        const furniIcon = this.furniIcon;
        const coinIcon = this.coinIcon;
        const andText = this.andText;
        const amountText = this.amountText;

        if(furniIcon) furniIcon.visible = node.type === TradeRequirementNode.TYPE_FURNI;
        if(coinIcon) coinIcon.visible = node.type === TradeRequirementNode.TYPE_COIN;
        if(andText) andText.visible = this._index > 0;
        if(amountText) amountText.visible = node.amount > 1;

        if(amountText && node.amount > 1) amountText.text = `${node.amount}x`;

        if(node.type === TradeRequirementNode.TYPE_FURNI && node.itemType !== null)
        {
            const widget = furniIcon?.widget as ProductIconWidget | null;

            if(widget) widget.productInfo = new ChestItemTypeRenderableWrapper(node.itemType);
        }
    }

    /**
	 * Non-null for the view's whole usable life: AS3 returns the field, which only becomes null in
	 * `dispose()`, and every caller reads it while the view is live.
	 */
    // AS3: OfferingNodeView.as::get window()
    get window(): IItemListWindow
    {
        return this._window!;
    }

    // AS3: OfferingNodeView.as::get andText()
    private get andText(): ITextWindow | null
    {
        return (this._window?.findChildByName('and_text') as ITextWindow | null) ?? null;
    }

    // AS3: OfferingNodeView.as::get amountText()
    private get amountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('amount_text') as ITextWindow | null) ?? null;
    }

    // AS3: OfferingNodeView.as::get furniIcon()
    private get furniIcon(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('furni_icon') as IWidgetWindow | null) ?? null;
    }

    // AS3: OfferingNodeView.as::get coinIcon()
    private get coinIcon(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('coin_icon') as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: OfferingNodeView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: OfferingNodeView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._requirementsModel = null;
        this._ruleView = null;
        this._window?.dispose();
        this._window = null;
        this._ruleNode = null;
        this._index = 0;
        this._disposed = true;
    }
}
