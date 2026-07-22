import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';
import {Util} from '@habbo/roomevents/Util';

import type {NewVariablePicker} from '../NewVariablePicker';
import {VariableNode} from '../overview/VariableNode';
import {TabButtonConfig} from './TabButtonConfig';

/**
 * TabButtonConfigs — the six variable-picker tabs (All / Recent / User-created / Dynamic / Internal /
 * Search) and the filter functions that build each tab's variable tree from the picker's filtered
 * variable list (grouping variables into a VariableNode tree by their dotted name segments).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/tabbuttons/TabButtonConfigs.as
 */
export class TabButtonConfigs
{
    // AS3: TabButtonConfigs.as::ALL_TAB_ID
    public static readonly ALL_TAB_ID: number = 0;

    // AS3: TabButtonConfigs.as::RECENT_TAB_ID
    public static readonly RECENT_TAB_ID: number = 1;

    // AS3: TabButtonConfigs.as::USER_CREATED_TAB_ID
    public static readonly USER_CREATED_TAB_ID: number = 2;

    // AS3: TabButtonConfigs.as::_SafeStr_10216 (name derived: the dynamic/"smart" tab id)
    public static readonly DYNAMIC_TAB_ID: number = 3;

    // AS3: TabButtonConfigs.as::INTERNAL_TAB_ID
    public static readonly INTERNAL_TAB_ID: number = 4;

    // AS3: TabButtonConfigs.as::_SafeStr_8853 (name derived: the search tab id)
    public static readonly SEARCH_TAB_ID: number = 5;

    // AS3: TabButtonConfigs.as::_SafeStr_5617 (name derived: the owning picker)
    private _picker: NewVariablePicker;

    // AS3: TabButtonConfigs.as::_SafeStr_6749 (name derived: the tab configs)
    private _tabButtons: TabButtonConfig[];

    // AS3: TabButtonConfigs.as::TabButtonConfigs()
    constructor(picker: NewVariablePicker)
    {
        this._picker = picker;
        this._tabButtons = [
            new TabButtonConfig(TabButtonConfigs.ALL_TAB_ID, 'var_picker_all', 'wiredfurni.variable_picker.tab.all', this.allFilter),
            new TabButtonConfig(TabButtonConfigs.RECENT_TAB_ID, 'var_picker_recent', 'wiredfurni.variable_picker.tab.recent', this.recentFilter),
            new TabButtonConfig(TabButtonConfigs.USER_CREATED_TAB_ID, 'var_picker_usermade', 'wiredfurni.variable_picker.tab.user_created', this.userCreatedFilter),
            new TabButtonConfig(TabButtonConfigs.DYNAMIC_TAB_ID, 'var_picker_smart', 'wiredfurni.variable_picker.tab.dynamic', this.dynamicFilter),
            new TabButtonConfig(TabButtonConfigs.INTERNAL_TAB_ID, 'var_picker_internal', 'wiredfurni.variable_picker.tab.internal', this.internalFilter),
            new TabButtonConfig(TabButtonConfigs.SEARCH_TAB_ID, 'var_picker_search', 'wiredfurni.variable_picker.tab.search', this.searchFilter)
        ];
    }

    // AS3: TabButtonConfigs.as::get tabButtons()
    get tabButtons(): TabButtonConfig[]
    {
        return this._tabButtons;
    }

    // AS3: TabButtonConfigs.as::nodesFromVector() — build a name-segmented VariableNode tree.
    private nodesFromVector(variables: WiredVariable[], flatten: boolean = false): VariableNode
    {
        const root = new VariableNode(null, null);

        for(const variable of variables)
        {
            const segments = Util.splitName(variable);
            let node = root;

            for(let i = 0; i < segments.length; i++)
            {
                const segment = segments[i];
                const isLast = i === segments.length - 1;
                let child = node.getChildNodeByName(segment);

                if(child === null)
                {
                    child = new VariableNode(isLast ? variable : null, segment);
                    node.addChildNode(child);
                }

                node = child;
            }
        }

        if(flatten)
        {
            for(const child of root.children)
            {
                child.flatten(true);
            }
        }

        return root;
    }

    // AS3: TabButtonConfigs.as::allFilter() — bound so it can be passed as a TabButtonConfig callback.
    private allFilter = (): VariableNode =>
    {
        return this.nodesFromVector(this._picker.filteredVariables);
    };

    // AS3: TabButtonConfigs.as::recentFilter()
    private recentFilter = (): VariableNode =>
    {
        const result: WiredVariable[] = [];
        const history = this._picker.roomEvents.variablePickerHelper.getHistory(this._picker.variableTarget);

        for(const id of history)
        {
            const variable = this._picker.filteredVariableById(id);

            if(variable !== null)
            {
                result.push(variable);
            }
        }

        return this.nodesFromVector(result, true);
    };

    // AS3: TabButtonConfigs.as::userCreatedFilter() — STANDARD (user-created) or GLOBAL variables.
    private userCreatedFilter = (): VariableNode =>
    {
        const result: WiredVariable[] = [];

        for(const variable of this._picker.filteredVariables)
        {
            if(variable.variableType === WiredVariableType.STANDARD || variable.variableType === WiredVariableType.GLOBAL)
            {
                result.push(variable);
            }
        }

        return this.nodesFromVector(result);
    };

    // AS3: TabButtonConfigs.as::dynamicFilter()
    private dynamicFilter = (): VariableNode =>
    {
        const result: WiredVariable[] = [];

        for(const variable of this._picker.filteredVariables)
        {
            if(variable.variableType === WiredVariableType.DYNAMIC)
            {
                result.push(variable);
            }
        }

        return this.nodesFromVector(result);
    };

    // AS3: TabButtonConfigs.as::internalFilter()
    private internalFilter = (): VariableNode =>
    {
        const result: WiredVariable[] = [];

        for(const variable of this._picker.filteredVariables)
        {
            if(variable.variableType === WiredVariableType.INTERNAL)
            {
                result.push(variable);
            }
        }

        return this.nodesFromVector(result);
    };

    // AS3: TabButtonConfigs.as::searchFilter()
    private searchFilter = (): VariableNode =>
    {
        const query = this._picker.inputField.text;

        // AS3: `_loc3_.length == ""` — a mixed int/String compare that coerces "" to 0, i.e. length 0.
        if(query.length === 0)
        {
            return this.nodesFromVector([]);
        }

        const terms = query.split(' ');
        const result: WiredVariable[] = [];

        for(const variable of this._picker.filteredVariables)
        {
            let matches = true;

            for(const term of terms)
            {
                if(variable.variableName.toLowerCase().indexOf(term.toLowerCase()) === -1)
                {
                    matches = false;
                    break;
                }
            }

            if(matches)
            {
                result.push(variable);
            }
        }

        return this.nodesFromVector(result, true);
    };
}
