import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * VariableValue — the "a wired variable's value matches" condition: a variable picker (variables that
 * hold a value) + a 6-way comparison radio + a value-or-variable reference section. The two variable
 * ids go to variableIds[0]/[1]; target/comparison/reference-option/reference-value(long)/reference-
 * target to intParams.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4119`; the name follows the code it returns
 * (ConditionCodes.VARIABLE_VALUE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4119.as
 */
export class VariableValue extends DefaultConditionType
{
    // AS3: _SafeCls_4119.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4119.as::_SafeStr_7857 (name derived: the comparison radio)
    private _comparisonRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4119.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4119.as::_section2
    private _section2!: SectionPreset;

    // AS3: _SafeCls_4119.as::_section3
    private _section3!: ValueOrVariableSection;

    // AS3: _SafeCls_4119.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4119.as::variableSelectionFilter1()
    private static variableSelectionFilter1(variable: WiredVariable): boolean
    {
        return variable.hasValue;
    }

    // AS3: _SafeCls_4119.as::get code()
    override get code(): number
    {
        return ConditionCodes.VARIABLE_VALUE;
    }

    // AS3: _SafeCls_4119.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._target);
        params.push(this._comparisonRadio.selected);
        params.push(this._section3.option);
        Util.pushIntAsLong(params, this._section3.numberValue);
        params.push(this._section3.target);

        return params;
    }

    // AS3: _SafeCls_4119.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection, this._section3.finalizeSelection];
    }

    // AS3: _SafeCls_4119.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId0 = def.variableIds[0];
        let variableId1 = def.variableIds[1];

        this._target = def.getInt(0);
        const comparison = def.getInt(1);
        const option = def.getInt(2);
        let value = def.getInt(4);
        const referenceTarget = def.getInt(5);

        this._picker.init(def.wiredContext.roomVariablesList, variableId0, this._target);
        this._comparisonRadio.selected = comparison;

        if(option === 0)
        {
            variableId1 = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 0;
        }

        this._section3.init(def.wiredContext.roomVariablesList, variableId1, referenceTarget, option, value);
    }

    // AS3: _SafeCls_4119.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
        this._section3.onEditInitialized();
    }

    // AS3: _SafeCls_4119.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 1)
        {
            return this._section3.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: _SafeCls_4119.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4119.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(VariableValue.variableSelectionFilter1);
        this._section1 = presetManager.createSection(this.l('variables.variable_selection'), this._picker, new SectionParam(sourceTypeParam));
        this._comparisonRadio = presetManager.createRadioGroup([new RadioButtonParam(2, '>'), new RadioButtonParam(5, '≥'), new RadioButtonParam(1, '='), new RadioButtonParam(3, '≤'), new RadioButtonParam(0, '<'), new RadioButtonParam(4, '≠')], null, 6);
        this._section2 = presetManager.createSection(this.l('comparison_selection'), this._comparisonRadio);
        this._section3 = presetManager.createValueOrVariableSection(1, this.mergedSourceOptions(1), this.l('variables.reference_value'), -2147483648, 2147483647);
        builder.addElements(this._section1, this._section2, this._section3);
    }

    // AS3: _SafeCls_4119.as::mergedSelectionTitle()
    override mergedSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.merged.title.variables';
        }

        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4119.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0], [1, 1]];
    }

    // AS3: _SafeCls_4119.as::setMergedType()
    override setMergedType(a: number, b: number): void
    {
        if(a === 0)
        {
            this._target = b;
            this._picker.variableTarget = this._target;
        }
        else
        {
            this._section3.target = b;
        }
    }

    // AS3: _SafeCls_4119.as::getMergedType()
    override getMergedType(id: number): number
    {
        if(id === 0)
        {
            return this._target;
        }

        return this._section3.target;
    }

    // AS3: _SafeCls_4119.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4119.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4119.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4119.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
