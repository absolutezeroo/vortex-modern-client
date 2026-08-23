import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {TradeRequirementRule} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';

import type {WiredTradeRequirementsModel} from '../WiredTradeRequirementsModel';
import type {OfferingRequirementsView} from './OfferingRequirementsView';
import {OfferingNodeView} from './OfferingNodeView';

/**
 * One rule — a set of terms that all have to be satisfied together — laid out as rows of at most
 * two.
 *
 * Rules are alternatives to each other, which is what the "or" on every rule but the first says.
 * Terms within a rule are joined by "and", which `OfferingNodeView` draws.
 *
 * The constructor tears its own template apart: the cloned window arrives holding one row holding
 * one node, and both are lifted out to be cloned per row and per term. What is left is an empty
 * `rule_nodes_rows` list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/offerings/OfferingRuleView.as
 */
export class OfferingRuleView implements IDisposable
{
    // AS3: OfferingRuleView.as::MAX_COLS
    public static readonly MAX_COLS: number = 2;

    // AS3: OfferingRuleView.as::NODE_VIEW_POOL
    public static readonly NODE_VIEW_POOL: OfferingNodeView[] = [];

    // AS3: OfferingRuleView.as::_disposed
    private _disposed: boolean = false;

    // AS3: OfferingRuleView.as::_SafeStr_5281 (the requirements model)
    private _model: WiredTradeRequirementsModel | null = null;

    // AS3: OfferingRuleView.as::_SafeStr_6958 (the offering view this rule belongs to)
    private _offeringView: OfferingRequirementsView | null = null;

    // AS3: OfferingRuleView.as::_SafeStr_7479 (the rule being drawn)
    private _rule: TradeRequirementRule | null = null;

    // AS3: OfferingRuleView.as::_SafeStr_6665 (this rule's index within its offering)
    private _index: number = 0;

    // AS3: OfferingRuleView.as::_window
    private _window: IWindowContainer | null;

    // AS3: OfferingRuleView.as::_SafeStr_6590 (the row template, lifted out of the clone)
    private _rowTemplate: IItemListWindow | null;

    // AS3: OfferingRuleView.as::_SafeStr_7420 (the node template, lifted out of the row)
    private _nodeTemplate: IItemListWindow | null;

    // AS3: OfferingRuleView.as::_SafeStr_9734 (the rows list's original x, restored on each layout)
    private _rowsOriginX: number = 0;

    // AS3: OfferingRuleView.as::_nodes
    private _nodes: OfferingNodeView[] | null = null;

    // AS3: OfferingRuleView.as::OfferingRuleView()
    constructor(template: IWindowContainer)
    {
        this._window = template.clone() as unknown as IWindowContainer;
        this._rowTemplate = this.rows?.removeListItemAt(0) as unknown as IItemListWindow | null;
        this._nodeTemplate = this._rowTemplate?.removeListItemAt(0) as unknown as IItemListWindow | null;
        this._rowsOriginX = this.rows?.x ?? 0;
    }

    // AS3: OfferingRuleView.as::claimNodeView()
    private static claimNodeView(template: IItemListWindow): OfferingNodeView
    {
        return OfferingRuleView.NODE_VIEW_POOL.pop() ?? new OfferingNodeView(template);
    }

    // AS3: OfferingRuleView.as::releaseNodeView()
    private static releaseNodeView(view: OfferingNodeView): void
    {
        view.recycle();
        OfferingRuleView.NODE_VIEW_POOL.push(view);
    }

    // AS3: OfferingRuleView.as::initialize()
    initialize(
        model: WiredTradeRequirementsModel,
        offeringView: OfferingRequirementsView,
        rule: TradeRequirementRule | null,
        index: number
    ): void
    {
        this._model = model;
        this._offeringView = offeringView;
        this._rule = rule;
        this._index = index;

        if(this._window !== null) this._window.width = offeringView.window.width;

        this._nodes = [];

        if(rule !== null && rule.nodes !== null && this._nodeTemplate !== null)
        {
            for(let i = 0; i < rule.nodes.length; i++)
            {
                const view = OfferingRuleView.claimNodeView(this._nodeTemplate);

                view.initialize(model, this, rule.nodes[i], i);
                this._nodes.push(view);
            }
        }

        this.initializeUI();
    }

    /**
     * Returns this view and every node under it to their pools, and destroys the rows it built —
     * the rows are clones made per layout, unlike the node windows, which are pooled.
     */
    // AS3: OfferingRuleView.as::recycle()
    recycle(): void
    {
        this._model = null;
        this._offeringView = null;
        this._rule = null;
        this._index = 0;

        for(const node of this._nodes ?? [])
        {
            const window = node.window;

            if(window !== null && window.parent !== null) window.parent = null;

            OfferingRuleView.releaseNodeView(node);
        }

        this._nodes = null;

        const rows = this.rows;

        while(rows !== null && rows.numListItems > 0)
        {
            const row = rows.removeListItemAt(0) as unknown as IItemListWindow | null;

            row?.removeListItems();
            row?.dispose();
        }
    }

    // AS3: OfferingRuleView.as::initializeUI()
    private initializeUI(): void
    {
        const rows = this.rows;

        if(rows === null) return;

        rows.x = this._rowsOriginX;

        let row: IItemListWindow | null = null;

        for(const node of this._nodes ?? [])
        {
            if(row === null || row.numListItems >= OfferingRuleView.MAX_COLS)
            {
                row = this._rowTemplate?.clone() as unknown as IItemListWindow | null;

                if(row !== null) rows.addListItem(row);
            }

            const nodeWindow = node.window;

            if(nodeWindow !== null) row?.addListItem(nodeWindow);
        }

        const orText = this.orText;

        if(orText !== null) orText.visible = this._index > 0;

        if(this._window !== null) this._window.height = rows.height;
    }

    /**
     * Centres the rows inside a box of the given width. Only ever called for a single-rule offering
     * — several rules stack left-aligned so their "or"s line up.
     */
    // AS3: OfferingRuleView.as::center()
    center(width: number): void
    {
        const rows = this.rows;

        if(rows === null) return;

        rows.x = width / 2 - this.colsWidth / 2;
    }

    // AS3: OfferingRuleView.as::get colsWidth()
    private get colsWidth(): number
    {
        const rows = this.rows;

        if(rows === null) return 0;

        let widest = 0;

        for(let i = 0; i < rows.numListItems; i++)
        {
            const row = rows.getListItemAt(i);

            if(row !== null && row.width > widest) widest = row.width;
        }

        return widest;
    }

    // AS3: OfferingRuleView.as::get window()
    get window(): IWindowContainer
    {
        return this._window as IWindowContainer;
    }

    // AS3: OfferingRuleView.as::get orText()
    private get orText(): ITextWindow | null
    {
        return (this._window?.findChildByName('or_text') ?? null) as ITextWindow | null;
    }

    // AS3: OfferingRuleView.as::get rows()
    private get rows(): IItemListWindow | null
    {
        return (this._window?.findChildByName('rule_nodes_rows') ?? null) as IItemListWindow | null;
    }

    // AS3: OfferingRuleView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: OfferingRuleView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.rows?.removeListItems();

        for(const node of this._nodes ?? []) OfferingRuleView.releaseNodeView(node);

        this._nodes = null;
        this._rowTemplate?.dispose();
        this._nodeTemplate?.dispose();
        this._rowTemplate = null;
        this._nodeTemplate = null;
        this._window?.dispose();
        this._window = null;
        this._rule = null;
        this._index = 0;
        this._offeringView = null;
        this._model = null;
        this._disposed = true;
    }
}
