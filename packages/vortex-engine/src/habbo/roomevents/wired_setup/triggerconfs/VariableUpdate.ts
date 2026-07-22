import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';
import {WiredVariableDataTypeExtended} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableDataTypeExtended';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {ISourceTypeListener} from '../inputsources/ISourceTypeListener';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * VariableUpdate — the "a wired variable is created/updated/deleted" trigger configuration: a variable
 * picker (variables whose changes can be intercepted) with a source-type selector, plus a
 * created/updated/deleted checkbox group (the "updated" option carrying a nested sub-option group).
 * Options are enabled per the picked variable's capabilities.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/VariableUpdate.as
 */
export class VariableUpdate extends DefaultTriggerConf implements ISourceTypeListener
{
    // AS3: VariableUpdate.as::CREATED_INDEX
    private static readonly CREATED_INDEX: number = 0;

    // AS3: VariableUpdate.as::_SafeStr_8449 (name derived: the updated-option index)
    private static readonly UPDATED_INDEX: number = 1;

    // AS3: VariableUpdate.as::DELETED_INDEX
    private static readonly DELETED_INDEX: number = 2;

    // AS3: VariableUpdate.as::_section1
    private _section1!: SectionPreset;

    // AS3: VariableUpdate.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: VariableUpdate.as::_optionGroup
    private _optionGroup!: CheckboxGroupPreset;

    // AS3: VariableUpdate.as::_subOptionGroup
    private _subOptionGroup!: CheckboxGroupPreset;

    // AS3: VariableUpdate.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.canInterceptChanges;
    }

    // AS3: VariableUpdate.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.VARIABLE_UPDATE;
    }

    // AS3: VariableUpdate.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        let target = WiredInputSourcePicker.USER_SOURCE;
        const variable = Util.findVariableById(def.wiredContext.roomVariablesList?.variables ?? [], variableId);

        if(variable !== null)
        {
            target = variable.variableTarget;
        }

        this._section1.getSourceTypeSelector()!.select(target);
        this._picker.init(def.wiredContext.roomVariablesList, variableId, target);
        this.onChangeVariable(this._picker.selected);
        this._optionGroup.optionById(VariableUpdate.CREATED_INDEX).selected = def.getBoolean(0);
        this._optionGroup.optionById(VariableUpdate.UPDATED_INDEX).selected = def.getBoolean(1);
        this._optionGroup.optionById(VariableUpdate.DELETED_INDEX).selected = def.getBoolean(2);
        this._subOptionGroup.mask = def.getInt(3);
    }

    // AS3: VariableUpdate.as::onChangeVariable() — bound (passed as the picker's onSelect callback).
    private onChangeVariable = (variable: WiredVariable | null): void =>
    {
        const canCreateDelete = variable === null || variable.canCreateAndDelete;
        const isGlobalOrExtended = variable !== null && (variable.variableType === WiredVariableType.GLOBAL || variable.availabilityType === WiredVariableDataTypeExtended.TYPE_21);
        const isDynamicOrInternal = variable !== null && (variable.variableType === WiredVariableType.DYNAMIC || variable.variableType === WiredVariableType.INTERNAL);
        const hasValue = variable === null || variable.hasValue;

        this._optionGroup.optionById(VariableUpdate.CREATED_INDEX).disabled = !canCreateDelete && !isGlobalOrExtended && !isDynamicOrInternal;
        this._optionGroup.optionById(VariableUpdate.UPDATED_INDEX).disabled = !hasValue && !isDynamicOrInternal;
        this._optionGroup.optionById(VariableUpdate.DELETED_INDEX).disabled = !canCreateDelete && !isGlobalOrExtended && !isDynamicOrInternal;
    };

    // AS3: VariableUpdate.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: VariableUpdate.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam([WiredInputSourcePicker.FURNI_SOURCE, WiredInputSourcePicker.USER_SOURCE, VariableExtraSourceTypes.GLOBAL_SOURCE], this);
        this._picker = presetManager.createVariablePicker(VariableUpdate.variableSelectionFilter, this.onChangeVariable);
        this._section1 = presetManager.createSection(this.loc('wiredfurni.params.variables.variable_selection'), this._picker, new SectionParam(sourceTypeParam));

        const optionParams = [
            new CheckboxOptionParam(this.l('variables.trigger_options.0'), VariableUpdate.CREATED_INDEX),
            new CheckboxOptionParam(this.l('variables.trigger_options.1'), VariableUpdate.UPDATED_INDEX),
            new CheckboxOptionParam(this.l('variables.trigger_options.2'), VariableUpdate.DELETED_INDEX)
        ];
        this._subOptionGroup = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.trigger_options.1.0'), 0), new CheckboxOptionParam(this.l('variables.trigger_options.1.1'), 1), new CheckboxOptionParam(this.l('variables.trigger_options.1.2'), 2)]);
        optionParams[1].extra2 = this._subOptionGroup;
        this._optionGroup = presetManager.createCheckboxGroup(optionParams);
        const optionSection = presetManager.createSection(this.l('variables.trigger_options'), this._optionGroup);
        builder.addElements(this._section1, optionSection);
    }

    // AS3: VariableUpdate.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection];
    }

    // AS3: VariableUpdate.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._optionGroup.optionById(VariableUpdate.CREATED_INDEX).selected ? 1 : 0);
        params.push(this._optionGroup.optionById(VariableUpdate.UPDATED_INDEX).selected ? 1 : 0);
        params.push(this._optionGroup.optionById(VariableUpdate.DELETED_INDEX).selected ? 1 : 0);
        params.push(this._subOptionGroup.mask);

        return params;
    }

    // AS3: VariableUpdate.as::set sourceType()
    set sourceType(value: number)
    {
        this._picker.variableTarget = value;
    }
}
