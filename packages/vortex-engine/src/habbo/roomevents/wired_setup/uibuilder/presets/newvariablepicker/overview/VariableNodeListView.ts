import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';

import type {NewVariablePicker} from '../NewVariablePicker';
import type {VariableNode} from './VariableNode';
import {VariableNodeView} from './VariableNodeView';

/**
 * VariableNodeListView — a scrollable list of VariableNodeView rows (one per VariableNode), clamped to
 * MAX_HEIGHT, tracking which row is hovered (so its submenu can open). Root lists fill the content box;
 * nested (submenu) lists are inset and get a border style.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/overview/VariableNodeListView.as
 */
export class VariableNodeListView implements IDisposable
{
    // AS3: VariableNodeListView.as::MAX_HEIGHT
    private static readonly MAX_HEIGHT: number = 300;

    // AS3: VariableNodeListView.as::SCROLLBAR_WIDTH
    private static readonly SCROLLBAR_WIDTH: number = 9;

    // AS3: VariableNodeListView.as::_window
    private _window: IWindowContainer;

    // AS3: VariableNodeListView.as::_picker
    private _picker: NewVariablePicker;

    // AS3: VariableNodeListView.as::_childNodes
    private _childNodes: VariableNodeView[];

    // AS3: VariableNodeListView.as::_currentHoveredNode
    private _currentHoveredNode: VariableNodeView | null = null;

    // AS3: VariableNodeListView.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableNodeListView.as::VariableNodeListView()
    constructor(picker: NewVariablePicker, nodes: VariableNode[], width: number, isRoot: boolean = false)
    {
        this._picker = picker;
        this._window = picker.expandedView!.overviewTemplate.clone() as unknown as IWindowContainer;

        if(!isRoot)
        {
            this._window.style = 12;
        }

        this._childNodes = [];
        this._window.width = width;

        if(nodes.length > 0)
        {
            for(let i = 0; i < nodes.length; i++)
            {
                const node = nodes[i];
                const view = new VariableNodeView(node, this._picker, this, i);
                this.nodesList.addListItem(view.window);
                this._childNodes.push(view);
            }

            const totalHeight = this._childNodes[0].window.height * nodes.length;
            this.nodesList.height = Math.min(totalHeight, VariableNodeListView.MAX_HEIGHT);

            let itemWidth = width - this.scrollbarWidth;

            if(!isRoot)
            {
                itemWidth -= 3;
            }

            for(const view of this._childNodes)
            {
                view.window.width = itemWidth;

                if(!isRoot)
                {
                    view.window.x = 1;
                }
            }
        }
        else
        {
            this.nodesList.height = 10;
        }
    }

    // AS3: VariableNodeListView.as::get scrollbarWidth()
    get scrollbarWidth(): number
    {
        return this.nodesList.isScrollBarVisible ? VariableNodeListView.SCROLLBAR_WIDTH : 0;
    }

    // AS3: VariableNodeListView.as::setHover()
    setHover(node: VariableNodeView | null): void
    {
        if(node === this._currentHoveredNode)
        {
            return;
        }

        if(this._currentHoveredNode !== null)
        {
            this._currentHoveredNode.hover = false;
            this._currentHoveredNode = null;
        }

        if(node !== null)
        {
            this._currentHoveredNode = node;
            node.hover = true;
        }
    }

    // AS3: VariableNodeListView.as::get childNodes()
    get childNodes(): VariableNodeView[]
    {
        return this._childNodes;
    }

    // AS3: VariableNodeListView.as::get window()
    get window(): IWindowContainer
    {
        return this._window;
    }

    // AS3: VariableNodeListView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        for(const view of this._childNodes)
        {
            view.dispose();
        }

        this.nodesList.removeListItems();
        this._childNodes = null as unknown as VariableNodeView[];
        this._picker = null as unknown as NewVariablePicker;
        this._window.dispose();
        this._window = null as unknown as IWindowContainer;
        this._currentHoveredNode = null;
        this._disposed = true;
    }

    // AS3: VariableNodeListView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VariableNodeListView.as::get nodesList()
    private get nodesList(): IScrollableListWindow
    {
        return this._window.findChildByName('nodes_list') as unknown as IScrollableListWindow;
    }
}
