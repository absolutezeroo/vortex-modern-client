import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import {Util} from '../../../../Util';
import {
    ChestItemTypeRenderableWrapper
} from '../../../../wired_trading/chests/subcontrollers/views/ChestItemTypeRenderableWrapper';
import type {TradeRuleEditorPreset} from './TradeRuleEditorPreset';

/**
 * One requirement chip inside a trade rule: an icon, a quantity, and a close button that only
 * appears while the pointer is over it.
 *
 * The window is **cloned** from a template passed in by the editor, so every chip is an independent
 * copy of one layout rather than a separately built window.
 *
 * The quantity border is deliberately hidden for a single furniture item — "1" is the assumed
 * amount and drawing a badge for it is noise — but always shown for coins, where the number is the
 * whole point.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/TradeRuleNodeView.as
 */
export class TradeRuleNodeView
{
    /**
	 * Class-level and never reset: the editor keys its chip pool on this, so two chips must not
	 * share an id even across different rules.
	 */
    // AS3: TradeRuleNodeView.as::UNIQUE_ID_COUNTER (renamed: the port reserves UPPER_SNAKE for
    // immutable statics, and this one is a counter)
    private static _uniqueIdCounter: number = 0;

    // AS3: TradeRuleNodeView.as::_SafeStr_6389 (name derived: the owning editor)
    private _editor: TradeRuleEditorPreset | null = null;

    // AS3: TradeRuleNodeView.as::_node
    private _node: TradeRequirementNode | null = null;

    // AS3: TradeRuleNodeView.as::_window
    private _window: IWindowContainer | null;

    // AS3: TradeRuleNodeView.as::_SafeStr_5943 (name derived: pointer is over the chip)
    private _hovered: boolean = false;

    // AS3: TradeRuleNodeView.as::_SafeStr_6682 (name derived: pointer is over the close region)
    private _closeHovered: boolean = false;

    // AS3: TradeRuleNodeView.as::_SafeStr_7796 (name derived: the chip may be removed)
    private _removable: boolean = true;

    // AS3: TradeRuleNodeView.as::_SafeStr_9597 (name derived: this chip's id)
    private _uniqueID: number;

    // AS3: TradeRuleNodeView.as::_SafeStr_5769 (name derived: disposed)
    private _disposed: boolean = false;

    // AS3: TradeRuleNodeView.as::TradeRuleNodeView()
    constructor(template: IWindow)
    {
        this._uniqueID = TradeRuleNodeView._uniqueIdCounter++;
        this._window = template.clone() as unknown as IWindowContainer;

        this._window.addEventListener('WME_OVER', this.onHover);
        this._window.addEventListener('WME_OUT', this.onHoverEnd);
        this._window.addEventListener('WME_CLICK', this.onClick);

        this.closeRegion?.addEventListener('WME_OVER', this.onCloseHover);
        this.closeRegion?.addEventListener('WME_OUT', this.onCloseHoverEnd);
        this.closeRegion?.addEventListener('WME_CLICK', this.onCloseClick);
    }

    /**
	 * Chips are pooled: `initialize()` and {@link release} are how the editor hands the same view a
	 * different node rather than building a new one, which is why both hover flags are cleared here.
	 */
    // AS3: TradeRuleNodeView.as::initialize()
    initialize(editor: TradeRuleEditorPreset, node: TradeRequirementNode, removable: boolean = true): void
    {
        this._editor = editor;
        this._node = node;
        this._removable = removable;
        this._hovered = false;
        this._closeHovered = false;

        if(this._window) Util.disableSection(this._window, false);

        this.updateUI();
    }

    /**
	 * Returned to the pool. `_removable` goes back to true rather than to its last value — the next
	 * user gets the default unless it says otherwise.
	 */
    // AS3: TradeRuleNodeView.as::release()
    release(): void
    {
        this._editor = null;
        this._node = null;
        this._removable = true;
    }

    // AS3: TradeRuleNodeView.as::onCloseClick()
    private onCloseClick = (): void =>
    {
        if(this._node === null) return;

        this._editor?.removeNode(this);
    };

    // AS3: TradeRuleNodeView.as::onClick()
    private onClick = (): void =>
    {
        if(this._node === null) return;

        this._editor?.editNode(this);
    };

    // AS3: TradeRuleNodeView.as::updateUI()
    private updateUI(): void
    {
        const node = this._node;

        if(node === null) return;

        const closeRegion = this.closeRegion;

        // Visible while either the chip or the close button itself is hovered — without the second
        // term the button would vanish the moment the pointer moved onto it.
        if(closeRegion) closeRegion.visible = this._removable && (this._hovered || this._closeHovered);

        const quantity = this.quantityAmount;
        const border = this.quantityBorder;

        if(quantity) quantity.text = String(node.amount);
        if(border) border.visible = node.amount !== 1 || node.type === TradeRequirementNode.TYPE_COIN;

        const iconWidget = this.iconWidget;
        const widget = iconWidget?.widget as ProductIconWidget | null;
        const coinsIcon = this.coinsIcon;

        if(node.type === TradeRequirementNode.TYPE_FURNI)
        {
            if(iconWidget) iconWidget.visible = true;

            if(widget)
            {
                widget.productInfo = node.itemType !== null
                    ? new ChestItemTypeRenderableWrapper(node.itemType)
                    : null;
            }

            if(coinsIcon) coinsIcon.visible = false;
        }
        else
        {
            if(iconWidget) iconWidget.visible = false;
            if(widget) widget.productInfo = null;
            if(coinsIcon) coinsIcon.visible = true;
        }
    }

    // AS3: TradeRuleNodeView.as::onHover()
    private onHover = (): void =>
    {
        if(this._node === null) return;

        this._hovered = true;
        this.updateUI();
    };

    // AS3: TradeRuleNodeView.as::onHoverEnd()
    private onHoverEnd = (): void =>
    {
        if(this._node === null) return;

        this._hovered = false;
        this.updateUI();
    };

    // AS3: TradeRuleNodeView.as::onCloseHover()
    private onCloseHover = (): void =>
    {
        if(this._node === null) return;

        this._closeHovered = true;
        this.updateUI();
    };

    // AS3: TradeRuleNodeView.as::onCloseHoverEnd()
    private onCloseHoverEnd = (): void =>
    {
        if(this._node === null) return;

        this._closeHovered = false;
        this.updateUI();
    };

    // AS3: TradeRuleNodeView.as::get window()
    get window(): IWindow | null
    {
        return this._window as unknown as IWindow | null;
    }

    // AS3: TradeRuleNodeView.as::get node()
    get node(): TradeRequirementNode | null
    {
        return this._node;
    }

    // AS3: TradeRuleNodeView.as::set node()
    set node(value: TradeRequirementNode | null)
    {
        this._node = value;
        this.updateUI();
    }

    // AS3: TradeRuleNodeView.as::get uniqueID()
    get uniqueID(): number
    {
        return this._uniqueID;
    }

    // AS3: TradeRuleNodeView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TradeRuleNodeView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._editor = null;
        this._node = null;
        this._window?.dispose();
        this._window = null;
        this._disposed = true;
    }

    // AS3: TradeRuleNodeView.as::get iconWidget()
    private get iconWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('element_icon_widget') as IWidgetWindow | null) ?? null;
    }

    // AS3: TradeRuleNodeView.as::get coinsIcon()
    private get coinsIcon(): IWindow | null
    {
        return this._window?.findChildByName('coins_icon') ?? null;
    }

    // AS3: TradeRuleNodeView.as::get quantityBorder()
    private get quantityBorder(): IWindow | null
    {
        return this._window?.findChildByName('quantity_border') ?? null;
    }

    // AS3: TradeRuleNodeView.as::get quantityAmount()
    private get quantityAmount(): ITextWindow | null
    {
        return (this._window?.findChildByName('quantity_amount') as ITextWindow | null) ?? null;
    }

    // AS3: TradeRuleNodeView.as::get closeRegion()
    private get closeRegion(): IWindow | null
    {
        return this._window?.findChildByName('close_region') ?? null;
    }
}
