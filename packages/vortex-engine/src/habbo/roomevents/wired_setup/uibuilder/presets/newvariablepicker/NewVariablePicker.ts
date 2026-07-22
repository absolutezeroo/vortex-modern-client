import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';
import type {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IFocusWindow} from '@core/window/components/IFocusWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {WiredStyle} from '../../styles/WiredStyle';
import {ExpandedVariablePickerView} from './ExpandedVariablePickerView';
import {TabButtonConfigs} from './tabbuttons/TabButtonConfigs';

/**
 * NewVariablePicker — the variable-picker widget controller: a collapsed input field that expands into
 * a tabbed, searchable dropdown of the room's wired variables (built from a "search_tree_dropdown"
 * layout). It owns filtering (by target and an optional variable filter), the current selection, the
 * expand/collapse lifecycle, and the keyboard/mouse handling; the expanded panel and its tree are the
 * ExpandedVariablePickerView / VariableNode* classes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/newvariablepicker/NewVariablePicker.as
 */
export class NewVariablePicker implements IDisposable
{
    // AS3: NewVariablePicker.as::UNSPECIFIED_TYPE
    public static readonly UNSPECIFIED_TYPE: number = 2147483647;

    // AS3: NewVariablePicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: NewVariablePicker.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: NewVariablePicker.as::_container
    private _container: IWindowContainer;

    // AS3: NewVariablePicker.as::_SafeStr_5598 (name derived: the expanded-view wrapper, on the desktop)
    private _expandedWrapper: IWindowContainer;

    // AS3: NewVariablePicker.as::_SafeStr_8223 (name derived: the input-field region)
    private _inputFieldRegion: IRegionWindow;

    // AS3: NewVariablePicker.as::_isExpanded
    private _isExpanded: boolean = false;

    // AS3: NewVariablePicker.as::_SafeStr_6623 (name derived: the optional variable filter)
    private _variableFilter: ((variable: WiredVariable) => boolean) | null;

    // AS3: NewVariablePicker.as::_SafeStr_8516 (name derived: the on-select callback)
    private _onSelect: ((variable: WiredVariable | null) => void) | null;

    // AS3: NewVariablePicker.as::_showFilteredVariables
    private _showFilteredVariables: boolean = true;

    // AS3: NewVariablePicker.as::_allVariables
    private _allVariables: SharedVariableList | null = null;

    // AS3: NewVariablePicker.as::_filteredVariables
    private _filteredVariables: WiredVariable[] = [];

    // AS3: NewVariablePicker.as::_selected
    private _selected: WiredVariable | null = null;

    // AS3: NewVariablePicker.as::_SafeStr_5920 (name derived: the current variable target)
    private _variableTarget: number = 0;

    // AS3: NewVariablePicker.as::_SafeStr_6683 (name derived: remembered selection per target)
    private _selectionByTarget: Map<number, WiredVariable | null>;

    // AS3: NewVariablePicker.as::_SafeStr_10091 (name derived: the initially-selected variable id)
    private _initialVariableId: string = '';

    // AS3: NewVariablePicker.as::_SafeStr_5569 (name derived: whether the query changed since selection)
    private _queryChanged: boolean = false;

    // AS3: NewVariablePicker.as::_SafeStr_4769 (name derived: the expanded view, lazily created)
    private _expandedView: ExpandedVariablePickerView | null = null;

    // AS3: NewVariablePicker.as::NewVariablePicker()
    constructor(roomEvents: HabboUserDefinedRoomEvents, container: IWindowContainer, variableFilter: ((variable: WiredVariable) => boolean) | null = null, onSelect: ((variable: WiredVariable | null) => void) | null = null, wiredStyle: WiredStyle | null = null)
    {
        this._roomEvents = roomEvents;
        this._container = container;
        this._variableFilter = variableFilter;
        this._onSelect = onSelect;
        this._selectionByTarget = new Map<number, WiredVariable | null>();
        this._inputFieldRegion = this._container.findChildByName('input_field_region') as unknown as IRegionWindow;
        this._expandedWrapper = this._container.findChildByName('expanded_view_wrapper') as unknown as IWindowContainer;
        (this._expandedWrapper.desktop as unknown as IWindowContainer).addChild(this._expandedWrapper);
        this._expandedWrapper.visible = false;
        this.setWiredStyle(wiredStyle);
        this.inputFieldRegion.addEventListener('WME_CLICK', this.onTextRegionClick);
        this.inputField.addEventListener('WME_CLICK', this.onTextRegionClick);
        this.cancelSearchButton.addEventListener('WME_CLICK', this.onCancelSearch);
        this.inputField.addEventListener('WE_CHANGE', this.onChangeQuery);
        this.inputField.addEventListener('WKE_KEY_UP', this.onKeyUp);
        this.inputPlaceholderText.visible = true;
        this.expandedWindowWrapper.setParamFlag(16, false);
        this.expandedWindowWrapper.addEventListener('WE_DEACTIVATED', this.onDeactivate);
        this.collapseView(true);
    }

    // AS3: NewVariablePicker.as::setWiredStyle()
    private setWiredStyle(wiredStyle: WiredStyle | null): void
    {
        if(wiredStyle === null)
        {
            return;
        }

        if(wiredStyle.name === 'illumina')
        {
            this.collapsedView.style = 105;
            (this._expandedWrapper.findChildByName('expanded_view') as unknown as IWindowContainer).style = 105;
        }
    }

    // AS3: NewVariablePicker.as::init()
    init(allVariables: SharedVariableList, selectedId: string, target: number): void
    {
        this._allVariables = allVariables;
        this._variableTarget = target;
        this._initialVariableId = selectedId;
        this._queryChanged = false;
        this._selectionByTarget = new Map<number, WiredVariable | null>();
        this._filteredVariables = this.filteredAllVariables;
        this.select(this.findVariableById(selectedId), true);

        if(this._expandedView !== null)
        {
            this._expandedView.selectTab(this._expandedView.tabById(this.determineInitialTab()));
        }
    }

    // AS3: NewVariablePicker.as::set variableTarget()
    set variableTarget(target: number)
    {
        if(target === this._variableTarget)
        {
            return;
        }

        this.collapseView();
        this.updateSelected();
        this._variableTarget = target;
        this._filteredVariables = this.filteredAllVariables;

        if(this._selectionByTarget.has(target))
        {
            this.select(this._selectionByTarget.get(target) ?? null);
        }
        else
        {
            this.select(null);
        }
    }

    // AS3: NewVariablePicker.as::get variableTarget()
    get variableTarget(): number
    {
        return this._variableTarget;
    }

    // AS3: NewVariablePicker.as::findVariableById()
    private findVariableById(id: string): WiredVariable | null
    {
        for(const variable of this._filteredVariables)
        {
            if(variable.variableId === id)
            {
                return variable;
            }
        }

        return null;
    }

    // AS3: NewVariablePicker.as::get filteredVariables()
    get filteredVariables(): WiredVariable[]
    {
        return this._filteredVariables;
    }

    // AS3: NewVariablePicker.as::filteredVariableById()
    filteredVariableById(id: string): WiredVariable | null
    {
        for(const variable of this._filteredVariables)
        {
            if(variable.variableId === id)
            {
                return variable;
            }
        }

        return null;
    }

    // AS3: NewVariablePicker.as::get filteredAllVariables()
    private get filteredAllVariables(): WiredVariable[]
    {
        if(this._allVariables === null || this._allVariables.variables === null)
        {
            return [];
        }

        const result: WiredVariable[] = [];

        for(const variable of this._allVariables.variables)
        {
            if((this._variableFilter === null || this._showFilteredVariables || this._variableFilter(variable)) && variable.variableName !== '' && (variable.variableTarget === this._variableTarget || this._variableTarget === NewVariablePicker.UNSPECIFIED_TYPE))
            {
                if(!(variable.isInvisible && this._initialVariableId !== variable.variableId))
                {
                    result.push(variable);
                }
            }
        }

        return result;
    }

    // AS3: NewVariablePicker.as::select()
    select(variable: WiredVariable | null, silent: boolean = false): void
    {
        this.collapseView();
        this._selectionByTarget.set(this._variableTarget, variable);
        this._selected = variable;
        this.inputField.text = variable !== null ? variable.variableName : '';
        this.updatePlaceholder();

        if(!silent && this._onSelect !== null)
        {
            this._onSelect(variable);
        }

        this._queryChanged = false;
    }

    // AS3: NewVariablePicker.as::get expandedView()
    get expandedView(): ExpandedVariablePickerView | null
    {
        return this._expandedView;
    }

    // AS3: NewVariablePicker.as::updateSelected()
    private updateSelected(): void
    {
        const match = this.filteredVariableByDisplayName(this.inputField.text);

        if(match !== null && this._selected !== match)
        {
            this.select(match);
        }

        if(this.inputField.text === '' && this._selected !== null)
        {
            this.select(null);
        }
    }

    // AS3: NewVariablePicker.as::get selected()
    get selected(): WiredVariable | null
    {
        this.updateSelected();
        return this._selected;
    }

    // AS3: NewVariablePicker.as::finalize()
    finalize(): void
    {
        this.updateSelected();

        if(this._selected !== null)
        {
            this._roomEvents.variablePickerHelper.addToHistory(this._selected);
        }
    }

    // AS3: NewVariablePicker.as::collapseView()
    private collapseView(force: boolean = false): void
    {
        if(!this._isExpanded && !force)
        {
            return;
        }

        this._isExpanded = false;
        this.collapsedView.visible = true;
        this.expandedWindowWrapper.visible = false;
        this.expandedWindowWrapper.deactivate();
        this.moveInputField(this.searchWrapperCollapsed);

        if(this._expandedView !== null)
        {
            this._expandedView.onHide();
        }
    }

    // AS3: NewVariablePicker.as::expandView()
    private expandView(): void
    {
        if(this._isExpanded)
        {
            return;
        }

        this._isExpanded = true;
        this.collapsedView.visible = false;

        const position = {x: 0, y: 0};
        this._container.getGlobalPosition(position);
        position.y -= this.searchWrapperExpanded.y;
        this.expandedWindowWrapper.setGlobalPosition(position);
        this.expandedWindowWrapper.visible = true;
        this.expandedWindowWrapper.activate();
        this.moveInputField(this.searchWrapperExpanded);
        (this.inputField as unknown as IFocusWindow).focus();
        this.showExpand();
        this._queryChanged = false;
    }

    // AS3: NewVariablePicker.as::showExpand()
    private showExpand(): void
    {
        if(this._expandedView !== null)
        {
            this._expandedView.onVisible();
            return;
        }

        this._expandedView = new ExpandedVariablePickerView(this, this.expandedWindowWrapper);
        this._expandedView.selectTab(this._expandedView.tabById(this.determineInitialTab()));
    }

    // AS3: NewVariablePicker.as::determineInitialTab()
    private determineInitialTab(): number
    {
        if(this._selected === null)
        {
            return TabButtonConfigs.USER_CREATED_TAB_ID;
        }

        if(this._selected.variableType === WiredVariableType.DYNAMIC)
        {
            return TabButtonConfigs.DYNAMIC_TAB_ID;
        }

        if(this._selected.variableType === WiredVariableType.INTERNAL)
        {
            return TabButtonConfigs.INTERNAL_TAB_ID;
        }

        return TabButtonConfigs.USER_CREATED_TAB_ID;
    }

    // AS3: NewVariablePicker.as::moveInputField()
    private moveInputField(wrapper: IWindowContainer): void
    {
        (this.inputFieldRegion.parent as unknown as IWindowContainer).removeChild(this.inputFieldRegion);
        wrapper.addChild(this.inputFieldRegion);
        this.inputFieldRegion.width = wrapper.width;
        this.inputFieldRegion.height = wrapper.height;
    }

    // AS3: NewVariablePicker.as::onDeactivate() — bound handler.
    private onDeactivate = (_event: WindowEvent): void =>
    {
        if(this._queryChanged)
        {
            const match = this.filteredVariableByDisplayName(this.inputField.text);

            if(match !== null)
            {
                this.select(match);
            }
            else
            {
                this.select(this._selected);
            }

            this._queryChanged = false;
        }

        this.collapseView();
    };

    // AS3: NewVariablePicker.as::filteredVariableByDisplayName()
    private filteredVariableByDisplayName(text: string): WiredVariable | null
    {
        for(const variable of this._filteredVariables)
        {
            if(!(this._variableFilter !== null && !this._variableFilter(variable)))
            {
                if(variable.variableName.toLowerCase() === text.toLowerCase())
                {
                    return variable;
                }

                const name = variable.variableName;

                if(text.toLowerCase() === name.toLowerCase())
                {
                    return variable;
                }
            }
        }

        return null;
    }

    // AS3: NewVariablePicker.as::onKeyUp() — bound handler.
    private onKeyUp = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 27)
        {
            this.collapseView();
        }
        else if(event.keyCode === 13)
        {
            const match = this.filteredVariableByDisplayName(this.inputField.text);

            if(match !== null)
            {
                this.select(match);
                return;
            }

            if(this.inputField.text === '')
            {
                this.select(null);
                return;
            }

            if(this._expandedView !== null && this._isExpanded)
            {
                const tab = this._expandedView.selectedTab;

                if(tab !== null && tab.tabConfig.tabId === TabButtonConfigs.SEARCH_TAB_ID)
                {
                    const listView = this._expandedView.activeItemsView;

                    if(listView !== null && listView.childNodes.length >= 1)
                    {
                        const node = listView.childNodes[0].variableNode;

                        if(node.variable !== null && node.canBeSelected(this))
                        {
                            this.select(node.variable);
                        }
                    }
                    else
                    {
                        this.select(null);
                    }
                }
            }
        }
    };

    // AS3: NewVariablePicker.as::onChangeQuery() — bound handler.
    private onChangeQuery = (_event: WindowEvent): void =>
    {
        if(this._isExpanded && this._expandedView !== null)
        {
            this._expandedView.selectTab(this._expandedView.tabById(TabButtonConfigs.SEARCH_TAB_ID), true);
        }

        this.updatePlaceholder();
        this._queryChanged = true;
    };

    // AS3: NewVariablePicker.as::updatePlaceholder()
    private updatePlaceholder(): void
    {
        this.cancelSearchButton.visible = this.inputField.text.length > 0;
        this.inputPlaceholderText.visible = this.inputField.text.length === 0;
    }

    // AS3: NewVariablePicker.as::onTextRegionClick() — bound handler.
    private onTextRegionClick = (_event: WindowMouseEvent): void =>
    {
        (this.inputField as unknown as IFocusWindow).focus();
        this.expandView();
    };

    // AS3: NewVariablePicker.as::onCancelSearch() — bound handler.
    private onCancelSearch = (_event: WindowMouseEvent): void =>
    {
        this.inputField.text = '';
        this.select(null);
        this.updatePlaceholder();
        (this.inputField as unknown as IFocusWindow).focus();
        this.expandView();
    };

    // AS3: NewVariablePicker.as::get showFilteredVariables()
    get showFilteredVariables(): boolean
    {
        return this._showFilteredVariables;
    }

    // AS3: NewVariablePicker.as::get variableFilter()
    get variableFilter(): ((variable: WiredVariable) => boolean) | null
    {
        return this._variableFilter;
    }

    // AS3: NewVariablePicker.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: NewVariablePicker.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        if(this._expandedView !== null)
        {
            (this._expandedWrapper.desktop as unknown as IWindowContainer).removeChild(this._expandedWrapper);
            this._expandedView.dispose();
            this._expandedView = null;
        }

        this._container = null as unknown as IWindowContainer;
        this._disposed = true;
    }

    // AS3: NewVariablePicker.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: NewVariablePicker.as::set width()
    set width(width: number)
    {
        this._container.width = width;
    }

    // AS3: NewVariablePicker.as::get window()
    get window(): IWindowContainer
    {
        return this._container;
    }

    // AS3: NewVariablePicker.as::get collapsedView()
    private get collapsedView(): IWindowContainer
    {
        return this._container.findChildByName('collapsed_view') as unknown as IWindowContainer;
    }

    // AS3: NewVariablePicker.as::get expandedWindowWrapper()
    private get expandedWindowWrapper(): IWindowContainer
    {
        return this._expandedWrapper;
    }

    // AS3: NewVariablePicker.as::get inputFieldRegion()
    private get inputFieldRegion(): IRegionWindow
    {
        return this._inputFieldRegion;
    }

    // AS3: NewVariablePicker.as::get inputPlaceholderText()
    private get inputPlaceholderText(): ITextWindow
    {
        return this._inputFieldRegion.findChildByName('input_placeholder_text') as unknown as ITextWindow;
    }

    // AS3: NewVariablePicker.as::get inputField()
    get inputField(): ITextFieldWindow
    {
        return this._inputFieldRegion.findChildByName('input_field') as unknown as ITextFieldWindow;
    }

    // AS3: NewVariablePicker.as::get searchWrapperCollapsed()
    private get searchWrapperCollapsed(): IWindowContainer
    {
        return this._container.findChildByName('search_wrapper_collapsed') as unknown as IWindowContainer;
    }

    // AS3: NewVariablePicker.as::get searchWrapperExpanded()
    private get searchWrapperExpanded(): IWindowContainer
    {
        return this._expandedWrapper.findChildByName('search_wrapper_expanded') as unknown as IWindowContainer;
    }

    // AS3: NewVariablePicker.as::get cancelSearchButton()
    private get cancelSearchButton(): IRegionWindow
    {
        return this._expandedWrapper.findChildByName('cancel_search') as unknown as IRegionWindow;
    }
}
