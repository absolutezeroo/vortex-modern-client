import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import type {WiredStyle} from '../../../styles/WiredStyle';
import type {NewVariablePicker} from '../NewVariablePicker';
import type {VariableNode} from './VariableNode';
import {VariableNodeListView} from './VariableNodeListView';

/**
 * VariableNodeView — one row of the variable-picker tree: the node's label + a right-triangle icon
 * (shown when it has children), with alternating/hover row colors and disabled/not-selectable dimming
 * and tooltips. Hovering a node with children spawns a nested VariableNodeListView submenu.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/overview/VariableNodeView.as
 */
export class VariableNodeView implements IDisposable
{
    // AS3: VariableNodeView.as::HOVER_BG
    private static readonly HOVER_BG: number = 4292927712;

    // AS3: VariableNodeView.as::MODE1_BG
    private static readonly MODE1_BG: number = 4293914607;

    // AS3: VariableNodeView.as::MODE2_BG
    private static readonly MODE2_BG: number = 4294638330;

    // AS3: VariableNodeView.as::_variableNode
    private _variableNode: VariableNode;

    // AS3: VariableNodeView.as::_picker
    private _picker: NewVariablePicker;

    // AS3: VariableNodeView.as::_window
    private _window: IRegionWindow;

    // AS3: VariableNodeView.as::_style
    private _style: WiredStyle;

    // AS3: VariableNodeView.as::_SafeStr_6665 (name derived: the row index, for alternating color)
    private _index: number;

    // AS3: VariableNodeView.as::_SafeStr_5943 (name derived: whether the row is hovered)
    private _hovered: boolean = false;

    // AS3: VariableNodeView.as::_SafeStr_8291 (name derived: whether the node can be selected)
    private _canBeSelected: boolean = false;

    // AS3: VariableNodeView.as::_SafeStr_8126 (name derived: whether the node is disabled)
    private _isDisabled: boolean = false;

    // AS3: VariableNodeView.as::_parent
    private _parent: VariableNodeListView;

    // AS3: VariableNodeView.as::_SafeStr_7141 (name derived: the hover submenu list)
    private _sublist: VariableNodeListView | null = null;

    // AS3: VariableNodeView.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableNodeView.as::VariableNodeView()
    constructor(variableNode: VariableNode, picker: NewVariablePicker, parent: VariableNodeListView, index: number)
    {
        this._variableNode = variableNode;
        this._picker = picker;
        this._index = index;
        this._parent = parent;
        this._style = picker.roomEvents.wiredCtrl.wiredStyle;
        this._window = picker.roomEvents.variablePickerHelper.acquireNodeView(this._style);
        this._canBeSelected = variableNode.canBeSelected(picker);
        this._isDisabled = variableNode.isDisabled(picker);
        this.icon.visible = variableNode.childrenCount > 0;
        this.nodeName.text = variableNode.name ?? '';
        this._window.interactiveCursorDisabled = !this._canBeSelected;
        this.nodeName.blend = this._isDisabled ? 0.55 : 1;
        this.icon.blend = this._isDisabled ? 0.55 : 1;
        this._window.addEventListener('WME_CLICK', this.onClick);
        this._window.addEventListener('WME_OVER', this.onOver);

        const localization = this._picker.roomEvents.localization;

        if(this._isDisabled)
        {
            this._window.toolTipCaption = localization.getLocalization('wiredfurni.variable_picker.tooltip_disabled');
        }
        else if(!this._canBeSelected)
        {
            this._window.toolTipCaption = localization.getLocalization('wiredfurni.variable_picker.tooltip_not_selectable');
        }
        else
        {
            this._window.toolTipCaption = '';
        }

        this.updateColoring();
    }

    // AS3: VariableNodeView.as::updateColoring()
    private updateColoring(): void
    {
        if(this._hovered)
        {
            this._window.color = VariableNodeView.HOVER_BG;
        }
        else if(this._index % 2 === 0)
        {
            this._window.color = VariableNodeView.MODE1_BG;
        }
        else
        {
            this._window.color = VariableNodeView.MODE2_BG;
        }
    }

    // AS3: VariableNodeView.as::onClick() — bound handler.
    private onClick = (_event: WindowMouseEvent): void =>
    {
        if(!this._canBeSelected)
        {
            return;
        }

        this._picker.select(this._variableNode.variable);
    };

    // AS3: VariableNodeView.as::onOver() — bound handler.
    private onOver = (_event: WindowMouseEvent): void =>
    {
        this._parent.setHover(this);
    };

    // AS3: VariableNodeView.as::set hover() — driven by the parent list's setHover().
    set hover(value: boolean)
    {
        if(this._hovered === value)
        {
            return;
        }

        this._hovered = value;
        this.updateColoring();

        if(this._variableNode.childrenCount > 0)
        {
            if(this._hovered)
            {
                this.initSublist();
            }
            else
            {
                this.removeSublist();
            }
        }
    }

    // AS3: VariableNodeView.as::initSublist() — open the child submenu to the right, clamped to desktop.
    private initSublist(): void
    {
        this._sublist = new VariableNodeListView(this._picker, this._variableNode.children, this._window.width);

        const sublistWindow = this._sublist.window;
        const parentWindow = this._picker.expandedView!.window;
        parentWindow.addChild(sublistWindow);

        const nodePosition = {x: 0, y: 0};
        this._window.getGlobalPosition(nodePosition);

        const parentPosition = {x: 0, y: 0};
        parentWindow.getGlobalPosition(parentPosition);

        sublistWindow.x = nodePosition.x - parentPosition.x + this._window.width + this._parent.scrollbarWidth;
        sublistWindow.y = nodePosition.y - parentPosition.y;

        const desktop = sublistWindow.desktop;
        const rectangle = {x: 0, y: 0, width: 0, height: 0};
        sublistWindow.getGlobalRectangle(rectangle);
        const rectangleBottom = rectangle.y + rectangle.height;

        // AS3: `_loc4_.offset(0, _loc3_.bottom - _loc1_.bottom)` — offset(0, dy) is just `y += dy`.
        if(desktop !== null && rectangleBottom > desktop.bottom)
        {
            sublistWindow.y += desktop.bottom - rectangleBottom;

            if(sublistWindow.y < 0)
            {
                sublistWindow.y = 0;
            }
        }
    }

    // AS3: VariableNodeView.as::removeSublist() — AS3 removes from `_window.parent` and does not null
    // _sublist afterwards (dispose is idempotent); preserved.
    private removeSublist(): void
    {
        if(this._sublist === null)
        {
            return;
        }

        (this._window.parent as unknown as IWindowContainer).removeChild(this._sublist.window);
        this._sublist.dispose();
    }

    // AS3: VariableNodeView.as::get variableNode()
    get variableNode(): VariableNode
    {
        return this._variableNode;
    }

    // AS3: VariableNodeView.as::get window()
    get window(): IRegionWindow
    {
        return this._window;
    }

    // AS3: VariableNodeView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.removeSublist();
        this._window.removeEventListener('WME_CLICK', this.onClick);
        this._window.removeEventListener('WME_OVER', this.onOver);
        this._picker.roomEvents.variablePickerHelper.releaseNodeView(this._style, this._window);
        this._picker = null as unknown as NewVariablePicker;
        this._window = null as unknown as IRegionWindow;
        this._style = null as unknown as WiredStyle;
        this._variableNode = null as unknown as VariableNode;
        this._index = 0;
        this._hovered = false;
        this._parent = null as unknown as VariableNodeListView;
        this._disposed = true;
    }

    // AS3: VariableNodeView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VariableNodeView.as::get icon()
    private get icon(): IIconWindow
    {
        return this._window.findChildByName('right_triangle_icon') as unknown as IIconWindow;
    }

    // AS3: VariableNodeView.as::get nodeName()
    private get nodeName(): ITextWindow
    {
        return this._window.findChildByName('node_name') as unknown as ITextWindow;
    }
}
