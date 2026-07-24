import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';
import {VariableInfoAndHoldersEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/VariableInfoAndHoldersEvent';
import type {VariableInfoAndHoldersParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/VariableInfoAndHoldersParser';
import {RequestVariableHoldersComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestVariableHoldersComposer';
import {RequestVariableManagementComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestVariableManagementComposer';

import {Util} from '../../../Util';
import {WiredInputSourcePicker} from '../../../wired_setup/inputsources/WiredInputSourcePicker';
import {VariableExtraSourceTypes} from '../../../wired_setup/common/VariableExtraSourceTypes';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';
import {VariableTypePicker} from '../common/VariableTypePicker';
import {VariableManagementConfig} from '../../variables_management/overview/VariableManagementConfig';
import {VariableTableObject} from './VariableTableObject';
import {PropertyTableObject} from './PropertyTableObject';
import {TextTableObject} from './TextTableObject';
import {VariableHoldersHighlighter} from './VariableHoldersHighlighter';

/**
 * WiredMenuOverviewTab — the "variable overview" tab: a source-type-filtered table of every wired
 * variable in the room, a properties table and a text-connector table for the selected variable, a
 * "highlight holders" mode that tints and value-bubbles every room object holding the variable, and a
 * "manage" button that opens the variable-management view for a persisted user variable. Supports
 * jump-to-variable from deep links and polls the variables synchronizer while viewing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_variable_overview/WiredMenuOverviewTab.as
 */
export class WiredMenuOverviewTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuOverviewTab.as::POLL_MS
    private static readonly POLL_MS: number = 500;

    // AS3: WiredMenuOverviewTab.as::MAX_HIGHLIGHTS
    private static readonly MAX_HIGHLIGHTS: number = 1000;

    // AS3: WiredMenuOverviewTab.as::MAX_HIGHLIGHTS_WITH_VALUE
    private static readonly MAX_HIGHLIGHTS_WITH_VALUE: number = 400;

    // AS3: WiredMenuOverviewTab.as::MAX_TEXT_CONNECTIONS
    private static readonly MAX_TEXT_CONNECTIONS: number = 400;

    // AS3: WiredMenuOverviewTab.as::LIST_COLUMN_NAME
    static readonly LIST_COLUMN_NAME: string = 'variable';

    // AS3: WiredMenuOverviewTab.as::PROPERTIES_COLUMN_PROPERTY
    static readonly PROPERTIES_COLUMN_PROPERTY: string = 'property';

    // AS3: WiredMenuOverviewTab.as::PROPERTIES_COLUMN_VALUE
    static readonly PROPERTIES_COLUMN_VALUE: string = 'value';

    // AS3: WiredMenuOverviewTab.as::_SafeStr_10294 (name derived: text-table value column id)
    static readonly TEXT_COLUMN_VALUE: string = 'value';

    // AS3: WiredMenuOverviewTab.as::_SafeStr_9408 (name derived: text-table text column id)
    static readonly TEXT_COLUMN_TEXT: string = 'text';

    // AS3: WiredMenuOverviewTab.as::_SafeStr_4883 (name derived: variable list table)
    private _variableTable: TableView;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_5970 (name derived: properties table)
    private _propertiesTable: TableView;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_5827 (name derived: texts table)
    private _textsTable: TableView;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_4965 (name derived: source-type picker)
    private _typePicker: VariableTypePicker | null;

    // AS3: WiredMenuOverviewTab.as::_highlighter
    private _highlighter: VariableHoldersHighlighter | null;

    // AS3: WiredMenuOverviewTab.as::_highlightEnabled
    private _highlightEnabled: boolean = false;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_8981 (name derived: last data-request timestamp)
    private _lastDataRequest: number = 0;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_9553 (name derived: last holders-request timestamp)
    private _lastHoldersRequest: number = 0;

    // AS3: WiredMenuOverviewTab.as::_allVariables
    private _allVariables: WiredVariable[] | null = null;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_7335 (name derived: pending focus-variable name)
    private _pendingFocusName: string | null = null;

    // AS3: WiredMenuOverviewTab.as::_SafeStr_8030 (name derived: focus variable)
    private _focusVariable: WiredVariable | null = null;

    // AS3: WiredMenuOverviewTab.as::WiredMenuOverviewTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
        this._highlighter = new VariableHoldersHighlighter(controller.roomEvents);
        this._variableTable = new TableView(controller.windowManager!, this.variableListContainer);
        this._propertiesTable = new TableView(controller.windowManager!, this.propertiesTableContainer);
        this._textsTable = new TableView(controller.windowManager!, this.textsTableContainer);
        this._typePicker = new VariableTypePicker(this.typePickerContainer, (id) => this.onSelectVariableType(id));
        this.createVariableList();
        this.createPropertiesTable();
        this.createTextTable();
        this.addMessageEvent(new VariableInfoAndHoldersEvent((event) => this.onAllVariableHolders(event)));
        this.highlightHoldersButton.addEventListener('WME_CLICK', this._onHighlightClick);
        this.manageButton.addEventListener('WME_CLICK', this._onManageClick);
    }

    // AS3: WiredMenuOverviewTab.as::createVariableList()
    private createVariableList(): void
    {
        const columns = [new TableColumn(WiredMenuOverviewTab.LIST_COLUMN_NAME, '', 1, 'left')];
        this._variableTable.initialize(columns, false);
        this._variableTable.onRowSelectedCallback = (object) => this.onSelectVariable(object);
    }

    // AS3: WiredMenuOverviewTab.as::createPropertiesTable()
    private createPropertiesTable(): void
    {
        const columns = [
            new TableColumn(WiredMenuOverviewTab.PROPERTIES_COLUMN_PROPERTY, this.loc('wiredmenu.variable_overview.properties.column.property'), 0.52, 'left'),
            new TableColumn(WiredMenuOverviewTab.PROPERTIES_COLUMN_VALUE, this.loc('wiredmenu.variable_overview.properties.column.value'), 0.48, 'left')
        ];
        this._propertiesTable.initialize(columns);
    }

    // AS3: WiredMenuOverviewTab.as::createTextTable()
    private createTextTable(): void
    {
        const columns = [
            new TableColumn(WiredMenuOverviewTab.TEXT_COLUMN_VALUE, this.loc('wiredmenu.variable_overview.text.column.value'), 0.2, 'left'),
            new TableColumn(WiredMenuOverviewTab.TEXT_COLUMN_TEXT, this.loc('wiredmenu.variable_overview.text.column.text'), 0.8, 'right')
        ];
        this._textsTable.initialize(columns);
    }

    // AS3: WiredMenuOverviewTab.as::startViewing()
    override startViewing(): void
    {
        super.startViewing();
        this.clearData();
        this.updateLoadingState();
        this.requestData();
    }

    // AS3: WiredMenuOverviewTab.as::isDataReady()
    protected override isDataReady(): boolean
    {
        return this._allVariables != null;
    }

    // AS3: WiredMenuOverviewTab.as::clearData()
    private clearData(): void
    {
        this._allVariables = null;
    }

    // AS3: WiredMenuOverviewTab.as::requestData()
    private requestData(): void
    {
        this._lastDataRequest = performance.now();
        this.controller.variablesSynchronizer.getAllVariables(this._onAllVariables);
    }

    // AS3: WiredMenuOverviewTab.as::requestHolders()
    private requestHolders(): void
    {
        this._lastHoldersRequest = performance.now();
        // AS3 passes selectedVariableId (possibly null); the highlight button is disabled unless a
        // variable is selected, so in practice it is non-null. Fall back to '' to stay type-safe.
        this.controller.send(new RequestVariableHoldersComposer(this.selectedVariableId ?? ''));
    }

    // AS3: WiredMenuOverviewTab.as::onAllVariables()
    private _onAllVariables = (variables: WiredVariable[]): void =>
    {
        this._allVariables = variables;

        if(this.isLoading)
        {
            this.updateLoadingState();
        }
        else
        {
            this.initializeInterface();
        }
    };

    // AS3: WiredMenuOverviewTab.as::onAllVariableHolders()
    private onAllVariableHolders(event: IMessageEvent): void
    {
        if(!this._highlightEnabled || !this.isViewing)
        {
            return;
        }

        const parser = event.parser as VariableInfoAndHoldersParser;
        const holders = parser.variableInfoAndHolders.holders;
        const variable = parser.variableInfoAndHolders.variable;

        if(variable.variableId !== this.selectedVariableId)
        {
            return;
        }

        if((!variable.hasValue && holders.length > WiredMenuOverviewTab.MAX_HIGHLIGHTS) || (variable.hasValue && holders.length > WiredMenuOverviewTab.MAX_HIGHLIGHTS_WITH_VALUE))
        {
            this.controller.roomEvents.notifications.addItem(this.loc('wiredmenu.variable_overview.highlight.error.too_many'), 'info', 'icon_wired_notification_png');
            this.stopHighlight();
            return;
        }

        const furniHeld = new Set<number>();
        const usersHeld = new Set<number>();

        for(const holder of holders)
        {
            const objectId = holder.objectId;
            const value = variable.hasValue ? holder.value : NaN;

            if(variable.variableTarget === WiredInputSourcePicker.FURNI_SOURCE)
            {
                this._highlighter!.highlightObject(objectId, Util.variableValueWithString(variable, value));
                furniHeld.add(objectId);
            }
            else if(variable.variableTarget === WiredInputSourcePicker.USER_SOURCE)
            {
                this._highlighter!.highlightUser(objectId, Util.variableValueWithString(variable, value));
                usersHeld.add(objectId);
            }
        }

        this._highlighter!.removeRemovedHolders(furniHeld, usersHeld);
    }

    // AS3: WiredMenuOverviewTab.as::get selectedVariableId()
    private get selectedVariableId(): string | null
    {
        return this.selectedVariable?.variableId ?? null;
    }

    // AS3: WiredMenuOverviewTab.as::get selectedVariable()
    private get selectedVariable(): WiredVariable | null
    {
        if(this._variableTable.selected == null)
        {
            return null;
        }

        return (this._variableTable.selected as VariableTableObject).variable;
    }

    // AS3: WiredMenuOverviewTab.as::initializeInterface()
    protected override initializeInterface(): void
    {
        if(this._pendingFocusName != null)
        {
            this.findFocusVariable(this._pendingFocusName);
            this._pendingFocusName = null;
        }

        this.updateVariableListUI();
        this.updatePropertiesTableUI();
        this.updateTextTableUI();
        this.updateButtonsUI();
    }

    // AS3: WiredMenuOverviewTab.as::updateVariableListUI()
    private updateVariableListUI(): void
    {
        const previousSelection = this._variableTable.selected;
        const rows: ITableObject[] = [];
        let focusRow: ITableObject | null = null;

        for(const variable of this._allVariables!)
        {
            if(!variable.isInvisible && variable.variableTarget === this._typePicker!.selectedType)
            {
                const row = new VariableTableObject(variable, this.controller.roomEvents);

                if(variable === this._focusVariable)
                {
                    focusRow = row;
                }

                rows.push(row);
            }
        }

        this._variableTable.setObjects(rows);

        if(focusRow != null)
        {
            this._variableTable.trySelect(focusRow);
        }
        else if(previousSelection == null && rows.length > 0)
        {
            this._variableTable.trySelect(rows[0]);
        }
        else if(previousSelection != null)
        {
            if(this._variableTable.selected == null)
            {
                this._variableTable.trySelect(rows[0]);
            }
        }

        this._focusVariable = null;
    }

    // AS3: WiredMenuOverviewTab.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        Util.disableSection(this.highlightHoldersButton, !this.canHighlightCurrentVariable);
        Util.disableSection(this.manageButton, !this.canManageCurrentVariable);
    }

    // AS3: WiredMenuOverviewTab.as::onSelectVariable()
    private onSelectVariable(_object: ITableObject | null): void
    {
        this._textsTable.resetScrollingNextUpdate();
        this.updatePropertiesTableUI();
        this.updateTextTableUI();

        if(this._highlightEnabled)
        {
            this._highlighter!.clear();

            if(this.canHighlightCurrentVariable)
            {
                this.requestHolders();
            }
        }

        this.updateButtonsUI();
    }

    // AS3: WiredMenuOverviewTab.as::get canHighlightCurrentVariable()
    private get canHighlightCurrentVariable(): boolean
    {
        const variable = this.getSelectedVariable();

        return variable != null
            && variable.variableType !== WiredVariableType.INTERNAL
            && (variable.variableTarget === WiredInputSourcePicker.USER_SOURCE || variable.variableTarget === WiredInputSourcePicker.FURNI_SOURCE);
    }

    // AS3: WiredMenuOverviewTab.as::get canManageCurrentVariable()
    private get canManageCurrentVariable(): boolean
    {
        const variable = this.getSelectedVariable();

        return variable != null && variable.variableTarget === WiredInputSourcePicker.USER_SOURCE && variable.isPersisted;
    }

    // AS3: WiredMenuOverviewTab.as::onHighlightClick()
    private _onHighlightClick = (_event: WindowMouseEvent): void =>
    {
        if(this._highlightEnabled)
        {
            this.stopHighlight();
        }
        else
        {
            this.startHighlight();
        }
    };

    // AS3: WiredMenuOverviewTab.as::onManageClick()
    private _onManageClick = (_event: WindowMouseEvent): void =>
    {
        const variable = this.getSelectedVariable();

        if(variable == null || !this.canManageCurrentVariable)
        {
            return;
        }

        this.controller.send(new RequestVariableManagementComposer(variable.variableId, 1, VariableManagementConfig.PAGE_SIZE, 0, -1));
    };

    // AS3: WiredMenuOverviewTab.as::startHighlight()
    private startHighlight(): void
    {
        this._highlightEnabled = true;
        this.highlightHoldersButton.caption = this.loc('wiredmenu.variable_overview.unhighlight_holders');
        this.requestHolders();
    }

    // AS3: WiredMenuOverviewTab.as::stopHighlight()
    private stopHighlight(): void
    {
        this._highlightEnabled = false;
        this.highlightHoldersButton.caption = this.loc('wiredmenu.variable_overview.highlight_holders');
        this._highlighter!.clear();
    }

    // AS3: WiredMenuOverviewTab.as::onSelectVariableType()
    private onSelectVariableType(_id: number): void
    {
        this._variableTable.resetScrollingNextUpdate();
        this.initializeInterface();
    }

    // AS3: WiredMenuOverviewTab.as::updatePropertiesTableUI()
    private updatePropertiesTableUI(): void
    {
        const variable = this.getSelectedVariable();

        if(variable == null)
        {
            this._propertiesTable.clear();
            return;
        }

        const rows: ITableObject[] = [];
        rows.push(new PropertyTableObject('name', variable.variableName, this.localization, true));
        rows.push(new PropertyTableObject('type', this.getTypeString(variable), this.localization));
        rows.push(new PropertyTableObject('target', this.getTargetString(variable), this.localization));
        rows.push(new PropertyTableObject('availability', this.getAvailabilityString(variable), this.localization));
        rows.push(new PropertyTableObject('has_value', variable.hasValue, this.localization));
        rows.push(new PropertyTableObject('can_write_to', variable.canWriteValue, this.localization));
        rows.push(new PropertyTableObject('can_create_delete', variable.canCreateAndDelete, this.localization));
        rows.push(new PropertyTableObject('can_intercept', variable.canInterceptChanges, this.localization));
        rows.push(new PropertyTableObject('is_always_available', variable.alwaysAvailable, this.localization));
        rows.push(new PropertyTableObject('can_read_creation_time', variable.canReadCreationTime, this.localization));
        rows.push(new PropertyTableObject('can_read_last_update_time', variable.canReadLastUpdateTime, this.localization));
        rows.push(new PropertyTableObject('is_text_connected', variable.hasTextConnector, this.localization));
        this._propertiesTable.setObjects(rows);
    }

    // AS3: WiredMenuOverviewTab.as::getTypeString()
    private getTypeString(variable: WiredVariable): string
    {
        return this.loc('wiredfurni.params.variables.idtype.' + variable.variableType);
    }

    // AS3: WiredMenuOverviewTab.as::getTargetString()
    private getTargetString(variable: WiredVariable): string
    {
        switch(variable.variableTarget)
        {
            case WiredInputSourcePicker.FURNI_SOURCE:
                return this.loc('wiredfurni.params.sourcetype.furni');
            case WiredInputSourcePicker.USER_SOURCE:
                return this.loc('wiredfurni.params.sourcetype.users');
            case VariableExtraSourceTypes.GLOBAL_SOURCE:
                return this.loc('wiredfurni.params.sourcetype.global');
            case VariableExtraSourceTypes.CONTEXT_SOURCE:
                return this.loc('wiredfurni.params.sourcetype.context');
            default:
                return '';
        }
    }

    // AS3: WiredMenuOverviewTab.as::getAvailabilityString()
    private getAvailabilityString(variable: WiredVariable): string
    {
        return this.localization.getLocalization('wiredfurni.params.variables.availability.' + variable.availabilityType, this.loc('wiredfurni.params.variables.availability.misc'));
    }

    // AS3: WiredMenuOverviewTab.as::updateTextTableUI()
    private updateTextTableUI(): void
    {
        const variable = this.getSelectedVariable();
        const noConnector = variable == null || !variable.hasTextConnector;

        if(noConnector)
        {
            this._textsTable.clear();
            Util.disableSection(this.textsTableContainer);
            return;
        }

        if(!this.textsTableContainer.isEnabled())
        {
            Util.disableSection(this.textsTableContainer, false);
        }

        const connector = variable!.textConnector!;
        const keys = connector.getKeys();
        keys.sort((a, b) => a - b);
        const rows: ITableObject[] = [];

        if(keys.length <= WiredMenuOverviewTab.MAX_TEXT_CONNECTIONS)
        {
            for(const key of keys)
            {
                const value = connector.getValue(key)!;
                rows.push(new TextTableObject(key, value));
            }
        }

        this._textsTable.setObjects(rows);
    }

    // AS3: WiredMenuOverviewTab.as::getSelectedVariable()
    private getSelectedVariable(): WiredVariable | null
    {
        const selected = this._variableTable.selected;

        if(selected == null)
        {
            return null;
        }

        return (selected as VariableTableObject).variable;
    }

    // AS3: WiredMenuOverviewTab.as::stopViewing()
    override stopViewing(): void
    {
        super.stopViewing();

        if(this._highlightEnabled)
        {
            this._highlighter!.clear();
        }
    }

    // AS3: WiredMenuOverviewTab.as::jumpToVariableByName()
    jumpToVariableByName(name: string): void
    {
        if(this.isDataReady())
        {
            this.findFocusVariable(name);
            this.initializeInterface();
        }
        else
        {
            this._pendingFocusName = name;
        }
    }

    // AS3: WiredMenuOverviewTab.as::findFocusVariable()
    private findFocusVariable(name: string): void
    {
        const variable = this.getVariableByNameOrPrefix(name);

        if(variable == null)
        {
            return;
        }

        this._typePicker!.selectedType = variable.variableTarget;
        this._focusVariable = variable;
    }

    // AS3: WiredMenuOverviewTab.as::getVariableByNameOrPrefix()
    private getVariableByNameOrPrefix(name: string): WiredVariable | null
    {
        let prefixMatch: WiredVariable | null = null;

        for(const variable of this._allVariables!)
        {
            if(!variable.isInvisible)
            {
                if(variable.variableName === name)
                {
                    return variable;
                }

                if(prefixMatch == null && variable.variableName.indexOf(name + '.') === 0)
                {
                    prefixMatch = variable;
                }
            }
        }

        return prefixMatch;
    }

    // AS3: WiredMenuOverviewTab.as::update()
    update(deltaTime: number): void
    {
        if(!this.isViewing)
        {
            return;
        }

        this._typePicker!.update(deltaTime);
        const now = performance.now();

        if(this._lastDataRequest < now - WiredMenuOverviewTab.POLL_MS)
        {
            this.requestData();
        }

        if(this.canHighlightCurrentVariable && this._highlightEnabled && this._lastHoldersRequest < now - WiredMenuOverviewTab.POLL_MS)
        {
            this.requestHolders();
        }

        this._highlighter!.update(deltaTime);
    }

    // AS3: WiredMenuOverviewTab.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        const highlightButton = this.highlightHoldersButton;

        if(highlightButton != null)
        {
            highlightButton.removeEventListener('WME_CLICK', this._onHighlightClick);
        }

        const manageButton = this.manageButton;

        if(manageButton != null)
        {
            manageButton.removeEventListener('WME_CLICK', this._onManageClick);
        }

        if(this.controller != null && this.controller.variablesSynchronizer != null)
        {
            this.controller.variablesSynchronizer.removeListener(this._onAllVariables);
        }

        if(this._typePicker != null)
        {
            this._typePicker.dispose();
            this._typePicker = null;
        }

        this._variableTable.dispose();
        this._variableTable = null as unknown as TableView;
        this._propertiesTable.dispose();
        this._propertiesTable = null as unknown as TableView;
        this._textsTable.dispose();
        this._textsTable = null as unknown as TableView;
        this._allVariables = null;

        if(this._highlighter != null)
        {
            this._highlighter.dispose();
            this._highlighter = null;
        }

        super.dispose();
    }

    // AS3: WiredMenuOverviewTab.as::get variableListContainer()
    private get variableListContainer(): IWindowContainer
    {
        return this.container.findChildByName('variable_list_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuOverviewTab.as::get propertiesTableContainer()
    private get propertiesTableContainer(): IWindowContainer
    {
        return this.container.findChildByName('variable_properties_table_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuOverviewTab.as::get textsTableContainer()
    private get textsTableContainer(): IWindowContainer
    {
        return this.container.findChildByName('variable_texts_table_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuOverviewTab.as::get highlightHoldersButton()
    private get highlightHoldersButton(): IInteractiveWindow
    {
        return this.container.findChildByName('highlight_holders_button') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuOverviewTab.as::get manageButton()
    private get manageButton(): IInteractiveWindow
    {
        return this.container.findChildByName('manage_button') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuOverviewTab.as::get typePickerContainer()
    private get typePickerContainer(): IWindowContainer
    {
        return this.container.findChildByName('type_picker_container') as unknown as IWindowContainer;
    }
}
