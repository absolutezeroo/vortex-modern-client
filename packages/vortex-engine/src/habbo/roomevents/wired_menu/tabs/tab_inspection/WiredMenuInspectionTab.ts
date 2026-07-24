import type {IUpdateReceiver} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {VariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableList';
import type {WiredObjectInspectionData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredObjectInspectionData';
import {WiredVariablesForObjectEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredVariablesForObjectEvent';
import type {WiredVariablesForObjectParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredVariablesForObjectParser';
import {WiredMenuErrorEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredMenuErrorEvent';
import {WiredMenuErrorParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredMenuErrorParser';
import {RequestWiredVariablesForObjectComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredVariablesForObjectComposer';
import {UpdateWiredVariableComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/UpdateWiredVariableComposer';

import {Util} from '../../../Util';
import {WiredInputSourcePicker} from '../../../wired_setup/inputsources/WiredInputSourcePicker';
import {VariableExtraSourceTypes} from '../../../wired_setup/common/VariableExtraSourceTypes';
import {NewVariablePicker} from '../../../wired_setup/uibuilder/presets/newvariablepicker/NewVariablePicker';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';
import {VariableTypePicker} from '../common/VariableTypePicker';
import {VariableHoldersHighlighter} from '../tab_variable_overview/VariableHoldersHighlighter';
import {VariableHolderPreviewer} from './VariableHolderPreviewer';
import {VariableValueTableObject} from './VariableValueTableObject';

/**
 * WiredMenuInspectionTab — the "inspection" tab: pick a furni or user (or the global scope) and inspect
 * every wired variable it holds, with an inline-editable value table, a create/delete-variable bubble,
 * a preview of the inspected holder, and a "highlight wireds" mode that tints the wireds referencing
 * the inspected furni. Drives a small fetch state machine and polls the server while displaying.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_inspection/WiredMenuInspectionTab.as
 */
export class WiredMenuInspectionTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuInspectionTab.as::POLL_VARIABLES_MS
    private static readonly POLL_VARIABLES_MS: number = 500;

    // AS3: WiredMenuInspectionTab.as::STATE_NOTHING
    private static readonly STATE_NOTHING: number = 0;

    // AS3: WiredMenuInspectionTab.as::STATE_FETCHING_HOLDING_VARIABLES
    private static readonly STATE_FETCHING_HOLDING_VARIABLES: number = 1;

    // AS3: WiredMenuInspectionTab.as::STATE_AWAITING_VARIABLES
    private static readonly STATE_AWAITING_VARIABLES: number = 2;

    // AS3: WiredMenuInspectionTab.as::STATE_DISPLAYING
    private static readonly STATE_DISPLAYING: number = 3;

    // AS3: WiredMenuInspectionTab.as::VARIABLES_COLUMN_VARIABLE
    static readonly VARIABLES_COLUMN_VARIABLE: string = 'variable';

    // AS3: WiredMenuInspectionTab.as::VARIABLES_COLUMN_VALUE
    static readonly VARIABLES_COLUMN_VALUE: string = 'value';

    // AS3: WiredMenuInspectionTab.as::_SafeStr_5103 (name derived: variable-values table)
    private _table: TableView;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_4965 (name derived: source-type picker)
    private _typePicker: VariableTypePicker;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_5561 (name derived: holder previewer)
    private _previewer: VariableHolderPreviewer;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_4597 (name derived: fetch state)
    private _state: number = WiredMenuInspectionTab.STATE_NOTHING;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_8981 (name derived: last request timestamp)
    private _lastRequest: number = 0;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_6056 (name derived: variableId -> variable cache)
    private _allVariables: Map<string, WiredVariable> = new Map<string, WiredVariable>();

    // AS3: WiredMenuInspectionTab.as::_SafeStr_4556 (name derived: current inspection data)
    private _data: WiredObjectInspectionData | null = null;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_9102 (name derived: last displayed type)
    private _lastType: number = -1;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_10113 (name derived: last displayed object id)
    private _lastObjectId: number = 0;

    // AS3: WiredMenuInspectionTab.as::_highlightingForFurni
    private _highlightingForFurni: number = -1;

    // AS3: WiredMenuInspectionTab.as::_highlighter
    private _highlighter: VariableHoldersHighlighter;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_7349 (name derived: pending re-select row index after delete)
    private _pendingReselectIndex: number = -1;

    // AS3: WiredMenuInspectionTab.as::_SafeStr_6148 (name derived: create-variable picker)
    private _createVariablePicker: NewVariablePicker;

    // AS3: WiredMenuInspectionTab.as::WiredMenuInspectionTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);
        this._highlighter = new VariableHoldersHighlighter(controller.roomEvents);
        this._table = new TableView(controller.windowManager!, this.variableValuesTableContainer);
        this._typePicker = new VariableTypePicker(this.typePickerContainer, (id) => this.onSelectVariableType(id));
        this._previewer = new VariableHolderPreviewer(this.previewContainer, controller);
        this.createVariableValuesTable();
        this._createVariablePicker = this.createCreateVariableBubble();
        this.updateTableUI();
        this.updatePreviewUI();
        this.addMessageEvent(new WiredVariablesForObjectEvent((event) => this.onWiredVariablesForObject(event)));
        this.addMessageEvent(new WiredMenuErrorEvent((event) => this.onWiredMenuError(event)));
        this.highlightWiredButton.addEventListener('WME_CLICK', this._onHighlightWiredsClicked);
        this.deleteVariableButton.addEventListener('WME_CLICK', this._onDeleteVariableClicked);
        this.addVariableButton.addEventListener('WME_CLICK', this._onAddVariableClicked);
        this.createVariableButton.addEventListener('WME_CLICK', this._onCreateVariableClicked);
        container.procedure = (event, window) => this.windowProcedure(event, window);
    }

    // AS3: WiredMenuInspectionTab.as::createVariableValuesTable()
    private createVariableValuesTable(): void
    {
        const columns = [
            new TableColumn(WiredMenuInspectionTab.VARIABLES_COLUMN_VARIABLE, this.loc('wiredmenu.inspection.variables.variable'), 0.65, 'left'),
            new TableColumn(WiredMenuInspectionTab.VARIABLES_COLUMN_VALUE, this.loc('wiredmenu.inspection.variables.value'), 0.35, 'right')
        ];
        this._table.initialize(columns);
        this._table.onCellEditCallback = (object, columnId, value) => this.onCellEdit(object, columnId, value);
        this._table.onRowSelectedCallback = (object) => this.onRowSelected(object);
    }

    // AS3: WiredMenuInspectionTab.as::createCreateVariableBubble()
    private createCreateVariableBubble(): NewVariablePicker
    {
        const roomEvents = this.controller.roomEvents;
        const presetManager = roomEvents.wiredCtrl.presetManager;
        const layout = presetManager.createLayout('search_tree_dropdown') as unknown as IWindowContainer;
        this.variablePickerContainer.addChild(layout);
        const picker = new NewVariablePicker(this.controller.roomEvents, layout, this._variableFilter, this._onChangeCreateVariable);
        picker.width = this.variablePickerContainer.width;
        this.createVariableBubble.visible = false;
        return picker;
    }

    // AS3: WiredMenuInspectionTab.as::onChangeCreateVariable()
    private _onChangeCreateVariable = (variable: WiredVariable | null): void =>
    {
        Util.disableSection(this.valueSettingContainer, variable != null && !variable.hasValue);
        Util.disableSection(this.createVariableButton, variable == null);
    };

    // AS3: WiredMenuInspectionTab.as::variableFilter()
    private _variableFilter = (variable: WiredVariable): boolean =>
    {
        return variable.canCreateAndDelete && (this._data == null || !this._data.variableValues.hasKey(variable.variableId));
    };

    // AS3: WiredMenuInspectionTab.as::startViewing()
    override startViewing(): void
    {
        super.startViewing();
        this.maybePollNewVariables(false);
    }

    // AS3: WiredMenuInspectionTab.as::maybePollNewVariables()
    private maybePollNewVariables(poll: boolean = true): void
    {
        if(this._state === WiredMenuInspectionTab.STATE_DISPLAYING)
        {
            if(!poll)
            {
                this._state = WiredMenuInspectionTab.STATE_FETCHING_HOLDING_VARIABLES;
                this.updateLoadingState();
            }

            this.requestVariablesForObject(this._data!.type, this.getObjectIdForType());
        }
    }

    // AS3: WiredMenuInspectionTab.as::getObjectIdForType()
    private getObjectIdForType(): number
    {
        if(this._data!.type === WiredInputSourcePicker.USER_SOURCE)
        {
            return this._data!.userIndex;
        }

        if(this._data!.type === WiredInputSourcePicker.FURNI_SOURCE)
        {
            return this._data!.objectId;
        }

        return 0;
    }

    // AS3: WiredMenuInspectionTab.as::isDataReady()
    protected override isDataReady(): boolean
    {
        return this._state === WiredMenuInspectionTab.STATE_NOTHING || this._state === WiredMenuInspectionTab.STATE_DISPLAYING;
    }

    // AS3: WiredMenuInspectionTab.as::clearDataAndState()
    private clearDataAndState(): void
    {
        this._state = WiredMenuInspectionTab.STATE_NOTHING;
        const previous = this._data;
        this._data = null;
        this.onDataChanged(previous, null);
        this.updateTableUI();
    }

    // AS3: WiredMenuInspectionTab.as::onCellEdit()
    private onCellEdit(object: ITableObject, columnId: string, value: string): void
    {
        if(columnId !== WiredMenuInspectionTab.VARIABLES_COLUMN_VALUE)
        {
            return;
        }

        const variable = (object as VariableValueTableObject).variable;

        if(!this.controller.hasWritePermission || !variable.hasValue || !variable.canWriteValue)
        {
            return;
        }

        const parsed = Util.getIntFromString(value, -2147483648, true);

        if(parsed !== -2147483648)
        {
            this.controller.send(new UpdateWiredVariableComposer(variable.variableTarget, this.getObjectIdForType(), variable.variableId, parsed, UpdateWiredVariableComposer.OPERATION_SET));
        }
    }

    // AS3: WiredMenuInspectionTab.as::onAddVariableClicked()
    private _onAddVariableClicked = (_event: WindowMouseEvent): void =>
    {
        if(this.createVariableBubble.visible)
        {
            this.createVariableBubble.visible = false;
        }
        else
        {
            this.controller.roomEvents.variablesSynchronizer.getAllVariables(this._initializeCreateVariableBubble, true);
        }
    };

    // AS3: WiredMenuInspectionTab.as::windowProcedure()
    private windowProcedure(event: WindowEvent, window: IWindow): void
    {
        if(event.type === 'WME_CLICK' && this.createVariableBubble.visible)
        {
            if(window.name !== 'add_var_btn' && !WiredMenuInspectionTab.windowIsChild(this.createVariableBubble as unknown as IWindow, window))
            {
                this.createVariableBubble.visible = false;
            }
        }
    }

    // AS3: WiredMenuInspectionTab.as::initializeCreateVariableBubble()
    private _initializeCreateVariableBubble = (variables: WiredVariable[]): void =>
    {
        this._createVariablePicker.init(new VariableList(variables.slice()), '', this._typePicker.selectedType);
        Util.disableSection(this.createVariableButton, true);
        this.createVariableBubble.visible = true;
    };

    // AS3: WiredMenuInspectionTab.as::onDeleteVariableClicked()
    private _onDeleteVariableClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._data == null)
        {
            return;
        }

        const selected = this._table.selected as VariableValueTableObject | null;

        if(selected == null)
        {
            return;
        }

        const variable = selected.variable;

        if(!this.controller.hasWritePermission || !variable.canCreateAndDelete)
        {
            return;
        }

        this._pendingReselectIndex = this._table.getIndexOfObject(selected);
        this.controller.send(new UpdateWiredVariableComposer(variable.variableTarget, this.getObjectIdForType(), variable.variableId, 0, UpdateWiredVariableComposer.OPERATION_DELETE));
    };

    // AS3: WiredMenuInspectionTab.as::onCreateVariableClicked()
    private _onCreateVariableClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._data == null)
        {
            return;
        }

        const variable = this._createVariablePicker.selected!;
        this._createVariablePicker.finalize();
        let value = 0;

        if(variable.hasValue)
        {
            const parsed = Number(this.valueInput.text);
            value = isNaN(parsed) ? 0 : Math.trunc(parsed);
        }

        this.controller.send(new UpdateWiredVariableComposer(variable.variableTarget, this.getObjectIdForType(), variable.variableId, value, UpdateWiredVariableComposer.OPERATION_CREATE));
        this.createVariableBubble.visible = false;
        this.valueInput.text = '0';
    };

    // AS3: WiredMenuInspectionTab.as::onWiredVariablesForObject()
    private onWiredVariablesForObject(event: IMessageEvent): void
    {
        if(this._state !== WiredMenuInspectionTab.STATE_FETCHING_HOLDING_VARIABLES && this._state !== WiredMenuInspectionTab.STATE_DISPLAYING)
        {
            return;
        }

        const data = (event.parser as WiredVariablesForObjectParser).data;

        if(data.type !== this._typePicker.selectedType)
        {
            return;
        }

        const previous = this._data;
        this._data = data;
        this.onDataChanged(previous, this._data);
        this._state = WiredMenuInspectionTab.STATE_AWAITING_VARIABLES;

        if(!this.controller.variablesSynchronizer.getAllVariables(this._onAllVariables, !this.allVariablesAvailable))
        {
            this.updateLoadingState();
        }
    }

    // AS3: WiredMenuInspectionTab.as::onWiredMenuError()
    private onWiredMenuError(event: IMessageEvent): void
    {
        const parser = event.parser as WiredMenuErrorParser;

        if(parser.errorCode === WiredMenuErrorParser.ERROR_OBJECT_GONE)
        {
            if(this._state !== WiredMenuInspectionTab.STATE_DISPLAYING)
            {
                this.clearDataAndState();
                this.updatePreviewUI();
                this.updateLoadingState();
            }
        }
    }

    // AS3: WiredMenuInspectionTab.as::get allVariablesAvailable()
    private get allVariablesAvailable(): boolean
    {
        for(const key of this._data!.variableValues.getKeys())
        {
            if(!this._allVariables.has(key))
            {
                return false;
            }
        }

        return true;
    }

    // AS3: WiredMenuInspectionTab.as::updatePreviewUI()
    private updatePreviewUI(): void
    {
        const isGlobal = this._typePicker.selectedType === VariableExtraSourceTypes.GLOBAL_SOURCE;
        Util.disableSection(this.pinContainer, isGlobal);
        const isFurni = this._typePicker.selectedType === WiredInputSourcePicker.FURNI_SOURCE;
        const isUser = this._typePicker.selectedType === WiredInputSourcePicker.USER_SOURCE;
        Util.disableSection(this.highlightWiredButton, this._data == null || this._data.type !== WiredInputSourcePicker.FURNI_SOURCE || this._data.configuredInWireds == null || this._data.configuredInWireds.length === 0);
        this.highlightWiredButton.visible = isFurni;

        if(isGlobal)
        {
            this._previewer.setGlobalPlaceholder();
            return;
        }

        if(!isFurni && !isUser)
        {
            this._previewer.clearPreviewer();
            return;
        }

        if(this._state === WiredMenuInspectionTab.STATE_NOTHING)
        {
            if(isFurni)
            {
                this._previewer.setFurniInstructions();
            }
            else if(isUser)
            {
                this._previewer.setUserInstructions();
            }
        }
        else if(this._state === WiredMenuInspectionTab.STATE_DISPLAYING)
        {
            if(isFurni)
            {
                this._previewer.setFurniByObjectId(this._data!.objectId);
            }
            else if(isUser)
            {
                this._previewer.setPreviewByUserIndex(this._data!.userIndex);
            }
        }
    }

    // AS3: WiredMenuInspectionTab.as::onHighlightWiredsClicked()
    private _onHighlightWiredsClicked = (_event: WindowMouseEvent): void =>
    {
        this._highlighter.clear();

        if(this._highlightingForFurni === -1 && this._data != null && this._data.configuredInWireds != null && this._data.configuredInWireds.length > 0)
        {
            for(const wiredId of this._data.configuredInWireds)
            {
                this._highlighter.highlightObject(wiredId, null);
            }

            this._highlightingForFurni = this._data.objectId;
        }
        else
        {
            this._highlightingForFurni = -1;
        }
    };

    // AS3: WiredMenuInspectionTab.as::onDataChanged()
    private onDataChanged(previous: WiredObjectInspectionData | null, next: WiredObjectInspectionData | null): void
    {
        if(next == null)
        {
            this.clearHighlights();
        }

        if(next != null && this._highlightingForFurni !== -1 && (next.type !== WiredInputSourcePicker.FURNI_SOURCE || next.objectId !== this._highlightingForFurni))
        {
            this.clearHighlights();
        }

        if(previous == null || next == null || previous.type !== next.type || previous.objectId !== next.objectId || previous.userIndex !== next.userIndex)
        {
            this.createVariableBubble.visible = false;
        }
    }

    // AS3: WiredMenuInspectionTab.as::clearHighlights()
    private clearHighlights(): void
    {
        this._highlighter.clear();
        this._highlightingForFurni = -1;
    }

    // AS3: WiredMenuInspectionTab.as::stopViewing()
    override stopViewing(): void
    {
        super.stopViewing();
        this.clearHighlights();
        this.createVariableBubble.visible = false;
    }

    // AS3: WiredMenuInspectionTab.as::updateTableUI()
    private updateTableUI(): void
    {
        if(this._state === WiredMenuInspectionTab.STATE_NOTHING)
        {
            this._table.clear();
            Util.disableSection(this.variableValuesTableContainer);
        }
        else if(this._state === WiredMenuInspectionTab.STATE_DISPLAYING)
        {
            if(!this.variableValuesTableContainer.isEnabled())
            {
                Util.disableSection(this.variableValuesTableContainer, false);
            }

            const variableValues = this._data!.variableValues;
            const variables: WiredVariable[] = [];

            for(const key of variableValues.getKeys())
            {
                const variable = this._allVariables.get(key);

                if(variable != null)
                {
                    variables.push(variable);
                }
            }

            Util.sortVariables(variables);
            const sameObject = this.getObjectIdForType() === this._lastObjectId && this._data!.type === this._lastType;
            const rows: ITableObject[] = [];

            for(const variable of variables)
            {
                if(!variable.isInvisible)
                {
                    rows.push(new VariableValueTableObject(variable, variableValues.getValue(variable.variableId)!, this.controller.hasWritePermission, sameObject, this.controller.roomEvents));
                }
            }

            this._table.setObjects(rows);
            this._lastObjectId = this.getObjectIdForType();
            this._lastType = this._data!.type;
        }

        this.updateButtonsUI();
    }

    // AS3: WiredMenuInspectionTab.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        let canDelete = false;
        let canAdd = false;

        if(this.controller.hasWritePermission)
        {
            const selected = this._table.selected as VariableValueTableObject | null;

            if(this._data != null && this._data.type !== VariableExtraSourceTypes.GLOBAL_SOURCE)
            {
                if(selected != null && selected.variable != null && selected.variable.canCreateAndDelete)
                {
                    canDelete = true;
                }

                canAdd = true;
            }
        }

        Util.disableSection(this.deleteVariableButton, !canDelete);
        Util.disableSection(this.addVariableButton, !canAdd);
    }

    // AS3: WiredMenuInspectionTab.as::onRowSelected()
    private onRowSelected(object: ITableObject | null): void
    {
        this.updateButtonsUI();

        if(object == null && this._pendingReselectIndex !== -1)
        {
            const reselect = this._table.getObjectByIndex(this._pendingReselectIndex) as VariableValueTableObject | null;
            this._table.trySelect(reselect);
            this._pendingReselectIndex = -1;
        }
    }

    // AS3: WiredMenuInspectionTab.as::onAllVariables()
    private _onAllVariables = (variables: WiredVariable[]): void =>
    {
        this._allVariables = new Map<string, WiredVariable>();

        for(const variable of variables)
        {
            this._allVariables.set(variable.variableId, variable);
        }

        if(this._state !== WiredMenuInspectionTab.STATE_AWAITING_VARIABLES)
        {
            return;
        }

        this._state = WiredMenuInspectionTab.STATE_DISPLAYING;
        this.updateTableUI();
        this.updateLoadingState();
        this.updatePreviewUI();
    };

    // AS3: WiredMenuInspectionTab.as::onSelectVariableType()
    private onSelectVariableType(id: number): void
    {
        this.clearDataAndState();
        this.initializeInterface();

        if(id === VariableExtraSourceTypes.GLOBAL_SOURCE)
        {
            this._state = WiredMenuInspectionTab.STATE_FETCHING_HOLDING_VARIABLES;
            this.requestVariablesForObject(id, 0);
            this.updateLoadingState();
        }

        this.updatePreviewUI();
        this.updateButtonsUI();
    }

    // AS3: WiredMenuInspectionTab.as::requestVariablesForObject()
    private requestVariablesForObject(type: number, objectId: number): void
    {
        this._lastRequest = performance.now();
        this.controller.send(new RequestWiredVariablesForObjectComposer(type, objectId));
    }

    // AS3: WiredMenuInspectionTab.as::inspectFurni()
    inspectFurni(id: number, fromLink: boolean = false): void
    {
        if(!this.isViewing)
        {
            return;
        }

        if(this.pinCheckbox.isSelected && this._state === WiredMenuInspectionTab.STATE_DISPLAYING && !fromLink)
        {
            return;
        }

        if(fromLink)
        {
            this.pinCheckbox.select();
        }

        const isFurni = this._typePicker.selectedType === WiredInputSourcePicker.FURNI_SOURCE;

        if(fromLink && !isFurni)
        {
            this._typePicker.selectedType = WiredInputSourcePicker.FURNI_SOURCE;
            this.updatePreviewUI();
        }
        else if(!isFurni)
        {
            return;
        }

        if(this._typePicker.selectedType === WiredInputSourcePicker.FURNI_SOURCE)
        {
            if(this._data != null && this._data.type === WiredInputSourcePicker.FURNI_SOURCE && this._data.objectId === id)
            {
                return;
            }

            this._state = WiredMenuInspectionTab.STATE_FETCHING_HOLDING_VARIABLES;
            this.updateLoadingState();
            this.requestVariablesForObject(WiredInputSourcePicker.FURNI_SOURCE, id);
        }
    }

    // AS3: WiredMenuInspectionTab.as::inspectUser()
    inspectUser(id: number, fromLink: boolean = false): void
    {
        if(!this.isViewing)
        {
            return;
        }

        if(this.pinCheckbox.isSelected && this._state === WiredMenuInspectionTab.STATE_DISPLAYING && !fromLink)
        {
            return;
        }

        if(fromLink)
        {
            this.pinCheckbox.select();
        }

        const isUser = this._typePicker.selectedType === WiredInputSourcePicker.USER_SOURCE;

        if(fromLink && !isUser)
        {
            this._typePicker.selectedType = WiredInputSourcePicker.USER_SOURCE;
            this.updatePreviewUI();
        }
        else if(!isUser)
        {
            return;
        }

        if(this._typePicker.selectedType === WiredInputSourcePicker.USER_SOURCE)
        {
            if(this._data != null && this._data.type === WiredInputSourcePicker.USER_SOURCE && this._data.userIndex === id)
            {
                return;
            }

            this._state = WiredMenuInspectionTab.STATE_FETCHING_HOLDING_VARIABLES;
            this.updateLoadingState();
            this.requestVariablesForObject(WiredInputSourcePicker.USER_SOURCE, id);
        }
    }

    // AS3: WiredMenuInspectionTab.as::update()
    update(deltaTime: number): void
    {
        if(!this.isViewing)
        {
            return;
        }

        this._typePicker.update(deltaTime);
        const now = performance.now();

        if(this._lastRequest < now - WiredMenuInspectionTab.POLL_VARIABLES_MS && this.isDataReady())
        {
            this.maybePollNewVariables();
        }

        this._highlighter.update(deltaTime);
    }

    // AS3: WiredMenuInspectionTab.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this.controller != null && this.controller.variablesSynchronizer != null)
        {
            this.controller.variablesSynchronizer.removeListener(this._onAllVariables);
        }

        this._typePicker.dispose();
        this._typePicker = null as unknown as VariableTypePicker;
        this._table.dispose();
        this._table = null as unknown as TableView;
        this._state = WiredMenuInspectionTab.STATE_NOTHING;
        this._allVariables = null as unknown as Map<string, WiredVariable>;
        this._data = null;
        this._previewer.dispose();
        this._previewer = null as unknown as VariableHolderPreviewer;
        this._highlighter.dispose();
        this._highlighter = null as unknown as VariableHoldersHighlighter;
        super.dispose();
    }

    // Descendant check for the click-outside handling (AS3 `_SafeCls_3721.windowIsChild`, not a port
    // window primitive): true if `candidate` is `ancestor` or sits anywhere below it.
    private static windowIsChild(ancestor: IWindow, candidate: IWindow | null): boolean
    {
        let window: IWindow | null = candidate;

        while(window != null)
        {
            if(window === ancestor)
            {
                return true;
            }

            window = window.parent;
        }

        return false;
    }

    // AS3: WiredMenuInspectionTab.as::get variableValuesTableContainer()
    private get variableValuesTableContainer(): IWindowContainer
    {
        return this.container.findChildByName('variable_values_table_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get typePickerContainer()
    private get typePickerContainer(): IWindowContainer
    {
        return this.container.findChildByName('type_picker_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get previewContainer()
    private get previewContainer(): IWindowContainer
    {
        return this.container.findChildByName('preview_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get pinContainer()
    private get pinContainer(): IWindowContainer
    {
        return this.container.findChildByName('pin_option_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get pinCheckbox()
    private get pinCheckbox(): ISelectableWindow
    {
        return this.container.findChildByName('pin_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get highlightWiredButton()
    private get highlightWiredButton(): IInteractiveWindow
    {
        return this.container.findChildByName('highlight_wired_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get deleteVariableButton()
    private get deleteVariableButton(): IInteractiveWindow
    {
        return this.container.findChildByName('delete_var_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get addVariableButton()
    private get addVariableButton(): IInteractiveWindow
    {
        return this.container.findChildByName('add_var_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get createVariableBubble()
    private get createVariableBubble(): IWindowContainer
    {
        return this.container.findChildByName('create_var_bubble') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get variablePickerContainer()
    private get variablePickerContainer(): IWindowContainer
    {
        return this.createVariableBubble.findChildByName('var_picker_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuInspectionTab.as::get valueInput()
    private get valueInput(): ITextWindow
    {
        return this.createVariableBubble.findChildByName('value_input') as unknown as ITextWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get createVariableButton()
    private get createVariableButton(): IInteractiveWindow
    {
        return this.createVariableBubble.findChildByName('create_var_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuInspectionTab.as::get valueSettingContainer()
    private get valueSettingContainer(): IWindowContainer
    {
        return this.createVariableBubble.findChildByName('value_setting') as unknown as IWindowContainer;
    }
}
