import type {VariableNode} from '../overview/VariableNode';

/**
 * TabButtonConfig — the definition of one variable-picker tab: its id, the tab-button asset uri, the
 * tooltip localization key, and the filter function that produces the tab's variable tree (root
 * VariableNode) when the tab is shown.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/tabbuttons/TabButtonConfig.as
 */
export class TabButtonConfig
{
    // AS3: TabButtonConfig.as::_SafeStr_10078 (name derived: the tab id)
    private _tabId: number;

    // AS3: TabButtonConfig.as::_assetUri
    private _assetUri: string;

    // AS3: TabButtonConfig.as::_SafeStr_10041 (name derived: the tooltip localization key)
    private _tooltipCaption: string;

    // AS3: TabButtonConfig.as::_SafeStr_9937 (name derived: the tree-building filter function)
    private _filteredVariables: () => VariableNode;

    // AS3: TabButtonConfig.as::TabButtonConfig()
    constructor(tabId: number, assetUri: string, tooltipCaption: string, filteredVariables: () => VariableNode)
    {
        this._tabId = tabId;
        this._assetUri = assetUri;
        this._tooltipCaption = tooltipCaption;
        this._filteredVariables = filteredVariables;
    }

    // AS3: TabButtonConfig.as::get tabId()
    get tabId(): number
    {
        return this._tabId;
    }

    // AS3: TabButtonConfig.as::get assetUri()
    get assetUri(): string
    {
        return this._assetUri;
    }

    // AS3: TabButtonConfig.as::get tooltipCaption()
    get tooltipCaption(): string
    {
        return this._tooltipCaption;
    }

    // AS3: TabButtonConfig.as::get filteredVariables()
    get filteredVariables(): () => VariableNode
    {
        return this._filteredVariables;
    }
}
