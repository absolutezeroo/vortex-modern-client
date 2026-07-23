import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import type {SharedVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/SharedVariableList';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

// AS3 uses an anonymous {id, name} object for each room; typed here for clarity.
interface IRoomEntry
{
    id: number;
    name: string;
}

/**
 * ReferenceVariable — the "reference another room's variable" wired variable: a variable-name section
 * plus a room dropdown and a variable dropdown (the variable list depends on the chosen room, sourced
 * from wiredContext.referenceVariablesList) and a read-only checkbox. The referenced variable id is
 * stored in variableIds[0]; read-only in intParams[0]; the local name in stringParam.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/ReferenceVariable.as
 */
export class ReferenceVariable extends DefaultVariableType
{
    // AS3: ReferenceVariable.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: ReferenceVariable.as::_roomDropdown
    private _roomDropdown!: DropdownPreset;

    // AS3: ReferenceVariable.as::_variableDropdown
    private _variableDropdown!: DropdownPreset;

    // AS3: ReferenceVariable.as::_SafeStr_6971 (name derived: the read-only checkbox group)
    private _readOnlyCheckbox!: CheckboxGroupPreset;

    // AS3: ReferenceVariable.as::_SafeStr_7007 (name derived: the currently referenced variable)
    private _currentVariable: WiredVariable | null = null;

    // AS3: ReferenceVariable.as::_rooms
    private _rooms: IRoomEntry[] = [];

    // AS3: ReferenceVariable.as::_SafeStr_5902 (name derived: roomId -> its wired variables)
    private _variablesByRoom: Map<number, WiredVariable[]> | null = null;

    // AS3: ReferenceVariable.as::_SafeStr_7419 (name derived: the current room's variable ids)
    private _variableIds: string[] | null = null;

    // AS3: ReferenceVariable.as::_SafeStr_7626 (name derived: the current room's wired variables)
    private _variables: WiredVariable[] = [];

    // AS3: ReferenceVariable.as::_SafeStr_5829 (name derived: the selected room id)
    private _selectedRoomId: number = -1;

    // AS3: ReferenceVariable.as::_SafeStr_5267 (name derived: whether the form is ready for callbacks)
    private _ready: boolean = false;

    // AS3: ReferenceVariable.as::get code()
    override get code(): number
    {
        return VariableCodes.REFERENCE_VARIABLE;
    }

    // AS3: ReferenceVariable.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        if(this._variableIds === null)
        {
            return [WiredVariable.DEFAULT_VARIABLE_ID];
        }

        const index = this._variableDropdown.selectedId;

        if(index < 0 || index >= this._variableIds.length)
        {
            return [WiredVariable.DEFAULT_VARIABLE_ID];
        }

        return [this._variableIds[index]];
    }

    // AS3: ReferenceVariable.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._readOnlyCheckbox.optionById(0).selected ? 1 : 0);

        return params;
    }

    // AS3: ReferenceVariable.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);

        // AS3 also guards `variableIds != null`; the port's Triggerable.variableIds is never null.
        const variableId = def.variableIds.length > 0 ? def.variableIds[0] : WiredVariable.DEFAULT_VARIABLE_ID;
        const readOnly = def.getInt(0) !== 0;

        this._readOnlyCheckbox.optionById(0).selected = readOnly;
        this._ready = false;

        const context = def.wiredContext.referenceVariablesList;

        this.initRooms(variableId, context);
        this.refreshVariables(variableId);
        this._currentVariable = this.findVariableById(variableId);
        this.initialVariableName = def.stringParam;
        this._ready = true;
        this.setEditable(context !== null);
    }

    // AS3: ReferenceVariable.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: ReferenceVariable.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ReferenceVariable.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._roomDropdown = presetManager.createDropdown(new DropdownParam(this.l('variables.room_selection.tooltip'), null, (option) => this.onRoomSelected(option as ExpandableDropdownOption | null)));
        const roomSection = presetManager.createSection(this.l('variables.room_selection'), this._roomDropdown);
        this._variableDropdown = presetManager.createDropdown(new DropdownParam(this.l('variables.variable_selection.tooltip'), null, (option) => this.onVariableSelected(option as ExpandableDropdownOption | null)));
        const variableSection = presetManager.createSection(this.l('variables.variable_ref_selection'), this._variableDropdown);
        this._readOnlyCheckbox = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.settings.read_only'))]);
        const settingsSection = presetManager.createSection(this.l('variables.settings'), this._readOnlyCheckbox);
        builder.addElements(this._variableName, roomSection, variableSection, settingsSection);
    }

    // AS3: ReferenceVariable.as::setEditable()
    private setEditable(editable: boolean): void
    {
        this._variableName.disabled = !editable;
        this._roomDropdown.disabled = !editable;
        this._variableDropdown.disabled = !editable;
        this._readOnlyCheckbox.disabled = !editable;
    }

    // AS3: ReferenceVariable.as::initRooms()
    private initRooms(variableId: string, context: SharedVariableList | null): void
    {
        this._variablesByRoom = new Map<number, WiredVariable[]>();
        this._rooms = [];

        let selectedRoom: IRoomEntry | null = null;
        const roomMap = new Map<number, IRoomEntry>();

        this._selectedRoomId = -1;

        if(context !== null)
        {
            for(const sharedVariable of context.sharedVariables)
            {
                let room: IRoomEntry;

                if(!roomMap.has(sharedVariable.roomId))
                {
                    room = {id: sharedVariable.roomId, name: sharedVariable.roomName};
                    roomMap.set(sharedVariable.roomId, room);
                    this._rooms.push(room);
                }
                else
                {
                    room = roomMap.get(sharedVariable.roomId)!;
                }

                if(!this._variablesByRoom.has(sharedVariable.roomId))
                {
                    this._variablesByRoom.set(sharedVariable.roomId, []);
                }

                this._variablesByRoom.get(sharedVariable.roomId)!.push(sharedVariable.wiredVariable);

                if(sharedVariable.wiredVariable.variableId === variableId)
                {
                    selectedRoom = room;
                }
            }

            this._rooms.sort((a, b) => a.name.localeCompare(b.name));
        }

        if(selectedRoom !== null)
        {
            this._selectedRoomId = selectedRoom.id;
        }

        const roomOptions: ExpandableDropdownOption[] = [];

        for(const room of this._rooms)
        {
            roomOptions.push(new ExpandableDropdownOption(room.id, room.name));
        }

        this._roomDropdown.reinit(roomOptions, this._selectedRoomId);
    }

    // AS3: ReferenceVariable.as::refreshVariables()
    private refreshVariables(variableId: string): void
    {
        this._variableIds = [];
        this._variables = [];

        const options: ExpandableDropdownOption[] = [];
        let selectedIndex = -1;

        if(this._variablesByRoom !== null && this._variablesByRoom.has(this._selectedRoomId))
        {
            const variables = this._variablesByRoom.get(this._selectedRoomId)!;
            let index = 0;

            for(const variable of variables)
            {
                options.push(new ExpandableDropdownOption(index, variable.variableName));
                this._variableIds.push(variable.variableId);
                this._variables.push(variable);

                if(variable.variableId === variableId)
                {
                    selectedIndex = index;
                }

                index++;
            }
        }

        this._variableDropdown.reinit(options, selectedIndex);
    }

    // AS3: ReferenceVariable.as::onRoomSelected()
    private onRoomSelected(option: ExpandableDropdownOption | null): void
    {
        if(!this._ready || option === null)
        {
            return;
        }

        if(this._selectedRoomId === option.id)
        {
            return;
        }

        this._selectedRoomId = option.id;
        this.refreshVariables(WiredVariable.DEFAULT_VARIABLE_ID);
        this.onVariableSelected(null);
    }

    // AS3: ReferenceVariable.as::onVariableSelected()
    private onVariableSelected(option: ExpandableDropdownOption | null): void
    {
        if(!this._ready)
        {
            return;
        }

        // AS3: `var _loc3_:int = param1?.id` — when the option is null the optional chain yields
        // undefined, which the int coercion turns into 0 (NOT -1).
        const index = option?.id ?? 0;
        const variable = index >= 0 && index < this._variables.length ? this._variables[index] : null;

        if(this._variableName.variableName.length === 0 || (this._currentVariable !== null && this._currentVariable.variableName === this._variableName.variableName))
        {
            this._variableName.variableName = variable !== null ? variable.variableName : '';
        }

        this._currentVariable = variable;
    }

    // AS3: ReferenceVariable.as::findVariableById()
    private findVariableById(variableId: string): WiredVariable | null
    {
        if(this._variablesByRoom === null)
        {
            return null;
        }

        for(const variables of this._variablesByRoom.values())
        {
            for(const variable of variables)
            {
                if(variable.variableId === variableId)
                {
                    return variable;
                }
            }
        }

        return null;
    }

    // AS3: ReferenceVariable.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection
    {
        return this._variableName;
    }
}
