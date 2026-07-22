import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {OrderedMap} from '@core/utils/OrderedMap';

import type {NewVariablePicker} from '../NewVariablePicker';

/**
 * VariableNode — one node of the variable-picker tree: it either wraps a WiredVariable (a leaf) or
 * groups named children (an intermediate name segment). flatten() collapses redundant single-child
 * grouping nodes; canBeSelected()/isDisabled() test a node against the picker's variable filter.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/overview/VariableNode.as
 */
export class VariableNode
{
    // AS3: VariableNode.as::_SafeStr_5878 (name derived: the wrapped variable, null for grouping nodes)
    private _variable: WiredVariable | null;

    // AS3: VariableNode.as::_children (name -> child node)
    private _children: OrderedMap<string, VariableNode>;

    // AS3: VariableNode.as::_name (null only for the tree root)
    private _name: string | null;

    // AS3: VariableNode.as::VariableNode()
    constructor(variable: WiredVariable | null, name: string | null)
    {
        this._variable = variable;
        this._name = name;
        this._children = new OrderedMap<string, VariableNode>();
    }

    // AS3: VariableNode.as::get name()
    get name(): string | null
    {
        return this._name;
    }

    // AS3: VariableNode.as::get variable()
    get variable(): WiredVariable | null
    {
        return this._variable;
    }

    // AS3: VariableNode.as::get children()
    get children(): VariableNode[]
    {
        return this._children.getValues();
    }

    // AS3: VariableNode.as::get childrenCount()
    get childrenCount(): number
    {
        return this._children.length;
    }

    // AS3: VariableNode.as::getChildNodeByName()
    getChildNodeByName(name: string): VariableNode | null
    {
        return this._children.getValue(name);
    }

    // AS3: VariableNode.as::addChildNode() — children always carry a real (non-null) name.
    addChildNode(node: VariableNode): void
    {
        this._children.add(node.name!, node);
    }

    // AS3: VariableNode.as::flatten() — collapse a single-child grouping node into its child; returns
    // whether this node is a leaf (a variable with no children).
    flatten(applyName: boolean = false): boolean
    {
        if(this._children.length === 1 && this._variable === null)
        {
            const only = this._children.getValues()[0];

            if(only.flatten())
            {
                this._variable = only.variable;
                this._children = new OrderedMap<string, VariableNode>();
            }
        }

        const isLeaf = this._variable !== null && this._children.length === 0;

        if(applyName && isLeaf)
        {
            this._name = this._variable!.variableName;
        }

        return isLeaf;
    }

    // AS3: VariableNode.as::canBeSelected()
    canBeSelected(picker: NewVariablePicker): boolean
    {
        if(this._variable === null)
        {
            return false;
        }

        const filter = picker.variableFilter;

        if(filter !== null && !filter(this._variable))
        {
            return false;
        }

        return true;
    }

    // AS3: VariableNode.as::isDisabled()
    isDisabled(picker: NewVariablePicker): boolean
    {
        if(this.canBeSelected(picker))
        {
            return false;
        }

        for(const child of this._children.getValues())
        {
            if(!child.isDisabled(picker))
            {
                return false;
            }
        }

        return true;
    }
}
