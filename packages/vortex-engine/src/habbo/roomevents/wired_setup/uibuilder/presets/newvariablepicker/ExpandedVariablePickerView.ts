import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IFocusWindow} from '@core/window/components/IFocusWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {NewVariablePicker} from './NewVariablePicker';
import {VariableNodeListView} from './overview/VariableNodeListView';
import type {TabButtonConfig} from './tabbuttons/TabButtonConfig';
import {TabButtonConfigs} from './tabbuttons/TabButtonConfigs';
import {TabButtonView} from './tabbuttons/TabButtonView';

/**
 * ExpandedVariablePickerView — the expanded variable-picker panel: it builds the row of tab buttons
 * (evenly dividing the width) and, for the active tab, loads a VariableNodeListView of the tab's
 * variable tree into the content box (or shows the empty state).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/ExpandedVariablePickerView.as
 */
export class ExpandedVariablePickerView implements IDisposable
{
    // AS3: ExpandedVariablePickerView.as::_picker
    private _picker: NewVariablePicker;

    // AS3: ExpandedVariablePickerView.as::_window
    private _window: IWindowContainer;

    // AS3: ExpandedVariablePickerView.as::_SafeStr_8214 (name derived: the tab-button template)
    private _tabButtonTemplate: IRegionWindow;

    // AS3: ExpandedVariablePickerView.as::_overviewTemplate
    private _overviewTemplate: IWindowContainer;

    // AS3: ExpandedVariablePickerView.as::_SafeStr_6749 (name derived: the tab-button views)
    private _tabButtonViews: TabButtonView[];

    // AS3: ExpandedVariablePickerView.as::_SafeStr_6563 (name derived: the tab configs)
    private _tabConfigs: TabButtonConfigs;

    // AS3: ExpandedVariablePickerView.as::_SafeStr_5098 (name derived: the selected tab)
    private _selectedTab: TabButtonView | null = null;

    // AS3: ExpandedVariablePickerView.as::_SafeStr_4840 (name derived: the active tab's node list)
    private _activeItemsView: VariableNodeListView | null = null;

    // AS3: ExpandedVariablePickerView.as::_disposed
    private _disposed: boolean = false;

    // AS3: ExpandedVariablePickerView.as::ExpandedVariablePickerView()
    constructor(picker: NewVariablePicker, window: IWindowContainer)
    {
        this._picker = picker;
        this._window = window;
        this._tabButtonTemplate = this.buttonList.removeListItemAt(0) as unknown as IRegionWindow;
        this._overviewTemplate = this.contentBox.removeChild(this.contentBox.getChildByName('variable_overview_template')!) as unknown as IWindowContainer;
        this.contentBox.removeChild(this.contentBox.getChildByName('node_template')!);
        this._tabConfigs = new TabButtonConfigs(picker);
        this._tabButtonViews = [];
        this.expandedWindow.width = picker.window.width;

        const perTabWidth = Math.trunc((this.expandedWindow.width - 3) / this._tabConfigs.tabButtons.length);
        // AS3 distributes `perTabWidth % numTabs` (not the width remainder) as +1px across the first tabs.
        let remainder = perTabWidth % this._tabConfigs.tabButtons.length;

        for(const config of this._tabConfigs.tabButtons)
        {
            let extra = 0;

            if(remainder > 0)
            {
                extra += 1;
                remainder -= 1;
            }

            const view = new TabButtonView(this, config, perTabWidth + extra);
            this._tabButtonViews.push(view);
            this.buttonList.addListItem(view.window);
        }
    }

    // AS3: ExpandedVariablePickerView.as::onHide()
    onHide(): void
    {
        if(this._activeItemsView !== null)
        {
            this.contentBox.removeChild(this._activeItemsView.window);
            this._activeItemsView.dispose();
            this._activeItemsView = null;
        }
    }

    // AS3: ExpandedVariablePickerView.as::onVisible()
    onVisible(): void
    {
        this.loadTab(this._selectedTab!.tabConfig);
    }

    // AS3: ExpandedVariablePickerView.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._picker.roomEvents;
    }

    // AS3: ExpandedVariablePickerView.as::tabById()
    tabById(id: number): TabButtonView | null
    {
        for(const view of this._tabButtonViews)
        {
            if(view.tabConfig.tabId === id)
            {
                return view;
            }
        }

        return null;
    }

    // AS3: ExpandedVariablePickerView.as::get selectedTab()
    get selectedTab(): TabButtonView | null
    {
        return this._selectedTab;
    }

    // AS3: ExpandedVariablePickerView.as::get activeItemsView()
    get activeItemsView(): VariableNodeListView | null
    {
        return this._activeItemsView;
    }

    // AS3: ExpandedVariablePickerView.as::selectTab()
    selectTab(tab: TabButtonView | null, forceReload: boolean = false): void
    {
        if(this._selectedTab === tab)
        {
            if(forceReload && this._selectedTab !== null)
            {
                this.loadTab(this._selectedTab.tabConfig);
            }

            return;
        }

        if(this._selectedTab !== null)
        {
            this._selectedTab.active = false;
            this._selectedTab = null;
        }

        if(tab !== null)
        {
            this._selectedTab = tab;
            this._selectedTab.active = true;
            this.loadTab(this._selectedTab.tabConfig);
        }

        (this._picker.inputField as unknown as IFocusWindow).focus();
    }

    // AS3: ExpandedVariablePickerView.as::loadTab()
    loadTab(tabConfig: TabButtonConfig): void
    {
        if(this._activeItemsView !== null)
        {
            this.contentBox.removeChild(this._activeItemsView.window);
            this._activeItemsView.dispose();
            this._activeItemsView = null;
        }

        const root = tabConfig.filteredVariables();

        if(root.childrenCount === 0)
        {
            this.emptyContainer.visible = true;
            this.contentBox.height = this.emptyContainer.height;
        }
        else
        {
            const nodes = root.children;
            this.emptyContainer.visible = false;
            this._activeItemsView = new VariableNodeListView(this._picker, nodes, this.contentBox.width, true);
            this.contentBox.addChild(this._activeItemsView.window);
            this.contentBox.height = this._activeItemsView.window.height;
        }
    }

    // AS3: ExpandedVariablePickerView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.buttonList.removeListItems();

        for(const view of this._tabButtonViews)
        {
            view.dispose();
        }

        if(this._activeItemsView !== null)
        {
            this._activeItemsView.dispose();
            this._activeItemsView = null;
        }

        this._tabButtonViews = null as unknown as TabButtonView[];
        this._picker = null as unknown as NewVariablePicker;
        this._window = null as unknown as IWindowContainer;
        this._tabButtonTemplate = null as unknown as IRegionWindow;
        this._tabConfigs = null as unknown as TabButtonConfigs;
        this._selectedTab = null;
        this._disposed = true;
    }

    // AS3: ExpandedVariablePickerView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: ExpandedVariablePickerView.as::get tabButtonTemplate()
    get tabButtonTemplate(): IRegionWindow
    {
        return this._tabButtonTemplate;
    }

    // AS3: ExpandedVariablePickerView.as::get overviewTemplate()
    get overviewTemplate(): IWindowContainer
    {
        return this._overviewTemplate;
    }

    // AS3: ExpandedVariablePickerView.as::get buttonList()
    private get buttonList(): IItemListWindow
    {
        return this._window.findChildByName('button_list') as unknown as IItemListWindow;
    }

    // AS3: ExpandedVariablePickerView.as::get expandedWindow()
    private get expandedWindow(): IWindowContainer
    {
        return this._window.findChildByName('expanded_view') as unknown as IWindowContainer;
    }

    // AS3: ExpandedVariablePickerView.as::get contentBox()
    private get contentBox(): IWindowContainer
    {
        return this._window.findChildByName('content_box') as unknown as IWindowContainer;
    }

    // AS3: ExpandedVariablePickerView.as::get emptyContainer()
    private get emptyContainer(): IWindowContainer
    {
        return this._window.findChildByName('empty_container') as unknown as IWindowContainer;
    }

    // AS3: ExpandedVariablePickerView.as::get window()
    get window(): IWindowContainer
    {
        return this._window;
    }
}
