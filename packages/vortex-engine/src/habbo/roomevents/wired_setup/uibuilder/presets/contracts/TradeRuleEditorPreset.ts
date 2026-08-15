import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import {
    TradeRequirementRule
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {Util} from '../../../../Util';
import {WiredUIPreset} from '../WiredUIPreset';
import {TradeRuleNodeView} from './TradeRuleNodeView';

/** TS-only: the four optional callbacks AS3 passes as bare `Function`s. */
export type TradeRuleEditNodeCallback = (editor: TradeRuleEditorPreset, uniqueId: number, node: TradeRequirementNode | null) => void;
/** TS-only: see {@link TradeRuleEditNodeCallback}. */
export type TradeRuleEditorCallback = (editor: TradeRuleEditorPreset) => void;
/** TS-only: see {@link TradeRuleEditNodeCallback}. */
export type TradeRuleChangeCallback = () => void;

/**
 * One editable trade rule: a titled row of requirement chips with an "add" button at the end.
 *
 * **Chip views are pooled across every editor**, in a class-level map keyed by style name — cloning
 * the node layout is the expensive part, and a contract screen builds and tears down rules
 * constantly. A style's pool is capped at {@link NODE_VIEW_POOL_MAX_SIZE}; past that, a released
 * view is disposed instead of kept.
 *
 * The chip template is not a layout of its own: the constructor **pulls the first grid item out** of
 * the rule window and keeps it as the thing to clone. That is why the grid starts one item short and
 * why `addNode()` inserts at `numGridItems - 1` — the last slot belongs to the add button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/TradeRuleEditorPreset.as
 */
export class TradeRuleEditorPreset extends WiredUIPreset
{
    // AS3: TradeRuleEditorPreset.as::NODE_VIEW_POOL_MAX_SIZE
    private static readonly NODE_VIEW_POOL_MAX_SIZE: number = 50;

    // AS3: TradeRuleEditorPreset.as::MAX_NODES_IN_RULE
    static readonly MAX_NODES_IN_RULE: number = 5;

    /**
	 * Shared by every editor in the client, keyed by style name so a chip cloned for one style is
	 * never handed to another.
	 */
    // AS3: TradeRuleEditorPreset.as::NODE_VIEW_POOL
    static readonly NODE_VIEW_POOL: OrderedMap<string, TradeRuleNodeView[]> = new OrderedMap<string, TradeRuleNodeView[]>();

    // AS3: TradeRuleEditorPreset.as::_container
    private _container: IWindowContainer | null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_7420 (name derived: the chip template)
    private _nodeTemplate: IWindow | null = null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_5186 (name derived: the live chips)
    private _nodeViews: TradeRuleNodeView[] = [];

    // AS3: TradeRuleEditorPreset.as::_SafeStr_7310 (name derived: edit-node callback)
    private _onEditNode: TradeRuleEditNodeCallback | null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_7275 (name derived: add-more callback)
    private _onAddMore: TradeRuleEditorCallback | null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_6777 (name derived: close-rule callback)
    private _onClose: TradeRuleEditorCallback | null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_7295 (name derived: change callback)
    private _onChange: TradeRuleChangeCallback | null;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_5943 (name derived: pointer over the rule)
    private _hovered: boolean = false;

    // AS3: TradeRuleEditorPreset.as::_SafeStr_6682 (name derived: pointer over the close region)
    private _closeHovered: boolean = false;

    // AS3: TradeRuleEditorPreset.as::TradeRuleEditorPreset()
    constructor(
        roomEvents: HabboUserDefinedRoomEvents,
        presetManager: PresetManager,
        wiredStyle: WiredStyle,
        title: string,
        onEditNode: TradeRuleEditNodeCallback | null,
        onAddMore: TradeRuleEditorCallback | null,
        onClose: TradeRuleEditorCallback | null = null,
        onChange: TradeRuleChangeCallback | null = null
    )
    {
        super(roomEvents, presetManager, wiredStyle);

        this._container = wiredStyle.createTradeRequirementRule() as unknown as IWindowContainer;
        this._onEditNode = onEditNode;
        this._onAddMore = onAddMore;
        this._onClose = onClose;
        this._onChange = onChange;

        this.updateTitle(title);

        // The template is *removed* from the grid, not copied — see the class note.
        this._nodeTemplate = this.itemGrid?.removeGridItemAt(0) ?? null;

        this.addMoreButton?.addEventListener('WME_CLICK', this.onAddMoreClicked);
        this._container.addEventListener('WME_OVER', this.onHover);
        this._container.addEventListener('WME_OUT', this.onHoverEnd);
        this.closeRegion?.addEventListener('WME_OVER', this.onCloseHover);
        this.closeRegion?.addEventListener('WME_OUT', this.onCloseHoverEnd);
        this.closeRegion?.addEventListener('WME_CLICK', this.onCloseClick);

        // 0x800000 off = the grid does not wrap; a one-line rule scrolls instead.
        if(this.isOneLineMode) this.itemGrid?.setParamFlag(8388608, false);

        this.updateCloseButtonVisibility();
    }

    /**
	 * Overridden to false by `NodeOverviewPreset`, which renders a read-only rule that may wrap over
	 * several lines.
	 */
    // AS3: TradeRuleEditorPreset.as::get isOneLineMode()
    protected get isOneLineMode(): boolean
    {
        return true;
    }

    // AS3: TradeRuleEditorPreset.as::get showNodeCloseButton()
    protected get showNodeCloseButton(): boolean
    {
        return true;
    }

    /**
	 * Replaces the whole rule. Each node is deep-copied on the way in (see {@link addNode}), so the
	 * editor never mutates the rule it was handed.
	 */
    // AS3: TradeRuleEditorPreset.as::set rule()
    set rule(value: TradeRequirementRule)
    {
        this.removeAllNodes();

        for(const node of value.nodes)
        {
            this.addNode(node);
        }
    }

    // AS3: TradeRuleEditorPreset.as::onAddMoreClicked()
    private onAddMoreClicked = (): void =>
    {
        this._onAddMore?.(this);
    };

    /**
	 * AS3 looks the chip up in the grid first and bails when it is not there — a chip mid-removal
	 * must not open an editor for a node the rule no longer has.
	 */
    // AS3: TradeRuleEditorPreset.as::editNode()
    editNode(view: TradeRuleNodeView): void
    {
        if(view.window === null) return;

        if((this.itemGrid?.getGridItemIndex(view.window) ?? -1) === -1) return;

        this._onEditNode?.(this, view.uniqueID, view.node);
    }

    // AS3: TradeRuleEditorPreset.as::updateTitle()
    updateTitle(title: string): void
    {
        const window = this.titleWindow;

        if(window) window.text = title;
    }

    // AS3: TradeRuleEditorPreset.as::fireOnChange()
    private fireOnChange(): void
    {
        this._onChange?.();
    }

    // AS3: TradeRuleEditorPreset.as::addNode()
    addNode(node: TradeRequirementNode): void
    {
        if(this.disposed) return;

        const grid = this.itemGrid;

        if(!grid) return;

        const view = this.createNodeView(node.deepCopy(), this.showNodeCloseButton);

        if(view.window) grid.addGridItemAt(view.window, grid.numGridItems - 1);

        this._nodeViews.push(view);
        this.onNodeCountChange();
    }

    // AS3: TradeRuleEditorPreset.as::createNodeView()
    private createNodeView(node: TradeRequirementNode, showCloseButton: boolean = true): TradeRuleNodeView
    {
        const pool = TradeRuleEditorPreset.poolForStyle(this._wiredStyle);
        const view = pool.length > 0 ? pool.pop()! : new TradeRuleNodeView(this._nodeTemplate!);

        view.initialize(this, node, showCloseButton);

        return view;
    }

    // AS3: TradeRuleEditorPreset.as::releaseNodeView()
    private releaseNodeView(view: TradeRuleNodeView): void
    {
        const pool = TradeRuleEditorPreset.poolForStyle(this._wiredStyle);

        if(pool.length >= TradeRuleEditorPreset.NODE_VIEW_POOL_MAX_SIZE)
        {
            view.dispose();
        }
        else
        {
            view.release();
            pool.push(view);
        }
    }

    /**
	 * TS-only: AS3 repeats the `hasKey` / `add` / `getValue` dance in both pool methods.
	 */
    // TS-only: AS3 inlines this hasKey/add/getValue dance in both pool methods.
    private static poolForStyle(style: WiredStyle): TradeRuleNodeView[]
    {
        if(!TradeRuleEditorPreset.NODE_VIEW_POOL.hasKey(style.name))
        {
            TradeRuleEditorPreset.NODE_VIEW_POOL.add(style.name, []);
        }

        return TradeRuleEditorPreset.NODE_VIEW_POOL.getValue(style.name)!;
    }

    // AS3: TradeRuleEditorPreset.as::updateNode()
    updateNode(uniqueId: number, node: TradeRequirementNode): void
    {
        if(this.disposed) return;

        const view = this.getNodeViewByUniqueId(uniqueId);

        if(view === null) return;

        view.node = node;
        this.fireOnChange();
    }

    /**
	 * Builds a rule out of the current chips. The nodes are handed over by reference — the copy was
	 * made on the way *in*, not out.
	 */
    // AS3: TradeRuleEditorPreset.as::finalizeRule()
    finalizeRule(): TradeRequirementRule
    {
        const nodes: TradeRequirementNode[] = [];

        for(const view of this._nodeViews)
        {
            if(view.node !== null) nodes.push(view.node);
        }

        return new TradeRequirementRule(nodes);
    }

    // AS3: TradeRuleEditorPreset.as::getNodeViewByUniqueId()
    private getNodeViewByUniqueId(uniqueId: number): TradeRuleNodeView | null
    {
        for(const view of this._nodeViews)
        {
            if(view.uniqueID === uniqueId) return view;
        }

        return null;
    }

    // AS3: TradeRuleEditorPreset.as::removeNode()
    removeNode(view: TradeRuleNodeView): void
    {
        const index = this._nodeViews.indexOf(view);

        if(index === -1) return;

        this._nodeViews.splice(index, 1);

        if(view.window) this.itemGrid?.removeGridItem(view.window);

        this.releaseNodeView(view);
        this.onNodeCountChange();
    }

    /**
	 * With an add button present the grid keeps its last item — that button — so the loop stops at
	 * one rather than clearing everything.
	 */
    // AS3: TradeRuleEditorPreset.as::removaAllNodes() [sic — AS3's own typo]
    private removeAllNodes(): void
    {
        const grid = this.itemGrid;

        if(grid)
        {
            if(this.addMoreButton !== null)
            {
                while(grid.numGridItems > 1)
                {
                    grid.removeGridItemAt(0);
                }
            }
            else
            {
                grid.removeGridItems();
            }
        }

        for(const view of this._nodeViews)
        {
            this.releaseNodeView(view);
        }

        this._nodeViews = [];
        this.onNodeCountChange();
    }

    /**
	 * A full rule *hides* the add button in one-line mode and merely greys it out otherwise — the
	 * one-line grid has no room to keep a dead button around.
	 */
    // AS3: TradeRuleEditorPreset.as::onNodeCountChange()
    protected onNodeCountChange(): void
    {
        this.itemGrid?.rebuildGridStructure();

        const addMore = this.addMoreButton;

        if(addMore !== null)
        {
            if(this.isOneLineMode)
            {
                addMore.visible = this._nodeViews.length < TradeRuleEditorPreset.MAX_NODES_IN_RULE;
            }
            else
            {
                Util.disableSection(addMore, this._nodeViews.length >= TradeRuleEditorPreset.MAX_NODES_IN_RULE);
            }
        }

        this.fireOnChange();
    }

    // AS3: TradeRuleEditorPreset.as::onCloseClick()
    private onCloseClick = (): void =>
    {
        this._onClose?.(this);
    };

    // AS3: TradeRuleEditorPreset.as::onHover()
    private onHover = (): void =>
    {
        this._hovered = true;
        this.updateCloseButtonVisibility();
    };

    // AS3: TradeRuleEditorPreset.as::onHoverEnd()
    private onHoverEnd = (): void =>
    {
        this._hovered = false;
        this.updateCloseButtonVisibility();
    };

    // AS3: TradeRuleEditorPreset.as::onCloseHover()
    private onCloseHover = (): void =>
    {
        this._closeHovered = true;
        this.updateCloseButtonVisibility();
    };

    // AS3: TradeRuleEditorPreset.as::onCloseHoverEnd()
    private onCloseHoverEnd = (): void =>
    {
        this._closeHovered = false;
        this.updateCloseButtonVisibility();
    };

    /**
	 * Gated on the close callback existing: a rule nobody can remove never shows the button, however
	 * long the pointer sits on it.
	 */
    // AS3: TradeRuleEditorPreset.as::updateCloseButtonVisibility()
    protected updateCloseButtonVisibility(): void
    {
        const region = this.closeRegion;

        if(region) region.visible = (this._hovered || this._closeHovered) && this._onClose !== null;
    }

    // AS3: TradeRuleEditorPreset.as::get nodeTemplate()
    get nodeTemplate(): IWindow | null
    {
        return this._nodeTemplate;
    }

    // AS3: TradeRuleEditorPreset.as::get window()
    override get window(): IWindow
    {
        return this._container as unknown as IWindow;
    }

    // AS3: TradeRuleEditorPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);

        if(this._container) this._container.width = width;
    }

    /**
	 * Empty on purpose: the chips are not presets, so the base has nothing to cascade into.
	 */
    // AS3: TradeRuleEditorPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [];
    }

    /**
	 * AS3 calls `removaAllNodes()` *before* the disposed check, so a second dispose still runs it —
	 * harmless, since the second pass finds an empty grid and an empty list.
	 */
    // AS3: TradeRuleEditorPreset.as::dispose()
    override dispose(): void
    {
        this.removeAllNodes();

        if(this.disposed)
        {
            return;
        }

        super.dispose();

        this._nodeViews = [];
        this._onEditNode = null;
        this._onAddMore = null;
        this._onClose = null;
        this._nodeTemplate?.dispose();
        this._nodeTemplate = null;
        this._container?.dispose();
        this._container = null;
    }

    // AS3: TradeRuleEditorPreset.as::get itemGrid()
    protected get itemGrid(): IItemGridWindow | null
    {
        return (this._container?.findChildByName('grid') as IItemGridWindow | null) ?? null;
    }

    // AS3: TradeRuleEditorPreset.as::get titleWindow()
    protected get titleWindow(): ITextWindow | null
    {
        return (this._container?.findChildByName('title') as ITextWindow | null) ?? null;
    }

    // AS3: TradeRuleEditorPreset.as::get addMoreContainer()
    protected get addMoreContainer(): IWindow | null
    {
        return this._container?.findChildByName('add_more_container') ?? null;
    }

    // AS3: TradeRuleEditorPreset.as::get addMoreButton()
    protected get addMoreButton(): IWindow | null
    {
        return this._container?.findChildByName('add_more') ?? null;
    }

    // AS3: TradeRuleEditorPreset.as::get closeRegion()
    protected get closeRegion(): IWindow | null
    {
        return this._container?.findChildByName('close_rule_region') ?? null;
    }
}
