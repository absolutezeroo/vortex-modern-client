import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ChangeVariable — the "change a wired variable" action: a variable picker (writable variables) + an
 * operator dropdown (basic + advanced "show more" operations) + a value-or-variable operand section
 * (disabled for operators that take no operand). Two variable ids and target/operator/option/value
 * (long)/reference-target intParams.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4139`; the name follows the code it returns
 * (ActionTypeCodes.CHANGE_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4139.as
 */
export class ChangeVariable extends DefaultActionType
{
    // AS3: _SafeCls_4139.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4139.as::_SafeStr_6442 (name derived: the operator dropdown)
    private _operatorDropdown!: DropdownPreset;

    // AS3: _SafeCls_4139.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4139.as::_section2
    private _section2!: SectionPreset;

    // AS3: _SafeCls_4139.as::_section3
    private _section3!: ValueOrVariableSection;

    // AS3: _SafeCls_4139.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4139.as::operatorOptions() — basic operations 0..6 plus advanced groups.
    private static operatorOptions(localization: {getLocalization(key: string, defaultValue?: string): string}): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(let i = 0; i < 7; i++)
        {
            options.push(new ExpandableDropdownOption(i, localization.getLocalization('wiredfurni.params.variables.operation.' + i), false));
        }

        options.push(new ExpandableDropdownOption(40, localization.getLocalization('wiredfurni.params.variables.operation.40'), true));
        options.push(new ExpandableDropdownOption(41, localization.getLocalization('wiredfurni.params.variables.operation.41'), true));
        options.push(new ExpandableDropdownOption(50, localization.getLocalization('wiredfurni.params.variables.operation.50'), true));
        options.push(new ExpandableDropdownOption(60, localization.getLocalization('wiredfurni.params.variables.operation.60'), true));

        for(let i = 100; i < 106; i++)
        {
            options.push(new ExpandableDropdownOption(i, localization.getLocalization('wiredfurni.params.variables.operation.' + i), true));
        }

        for(let i = 110; i < 119; i++)
        {
            options.push(new ExpandableDropdownOption(i, localization.getLocalization('wiredfurni.params.variables.operation.' + i), true));
        }

        return options;
    }

    // AS3: _SafeCls_4139.as::variableSelectionFilter1()
    private static variableSelectionFilter1(variable: WiredVariable): boolean
    {
        return variable.canWriteValue;
    }

    // AS3: _SafeCls_4139.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CHANGE_VARIABLE;
    }

    // AS3: _SafeCls_4139.as::requiresOperand()
    requiresOperand(): boolean
    {
        return this._operatorDropdown.selectedId !== 103 && this._operatorDropdown.selectedId !== 60 && this._operatorDropdown.selectedId !== 110;
    }

    // AS3: _SafeCls_4139.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._target);
        params.push(this._operatorDropdown.selectedId);
        params.push(this.requiresOperand() ? this._section3.option : 0);
        Util.pushIntAsLong(params, this._section3.numberValue);
        params.push(this._section3.target);

        return params;
    }

    // AS3: _SafeCls_4139.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection, this._section3.finalizeSelection];
    }

    // AS3: _SafeCls_4139.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const intParams = def.intParams;
        const variableId0 = def.variableIds[0];
        let variableId1 = def.variableIds[1];

        this._target = intParams[0];
        const operator = intParams[1];
        const option = intParams[2];
        let value = intParams[4];
        const referenceTarget = intParams[5];

        this._picker.init(def.wiredContext.roomVariablesList, variableId0, this._target);

        if(option === 0)
        {
            variableId1 = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 0;
        }

        this._section3.init(def.wiredContext.roomVariablesList, variableId1, referenceTarget, option, value);
        this._operatorDropdown.selectedId = operator;
    }

    // AS3: _SafeCls_4139.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
        this._section3.onEditInitialized();
    }

    // AS3: _SafeCls_4139.as::onChangeOperator() — the dropdown option arg is unused (AS3 ignores it).
    private onChangeOperator(): void
    {
        this._section3.disabled = !this.requiresOperand();
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 1);
    }

    // AS3: _SafeCls_4139.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 1)
        {
            return this._section3.isSourcePickingDisabled() || !this.requiresOperand();
        }

        return false;
    }

    // AS3: _SafeCls_4139.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4139.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(ChangeVariable.variableSelectionFilter1);
        this._section1 = presetManager.createSection(this.l('variables.variable_selection'), this._picker, new SectionParam(sourceTypeParam));
        this._operatorDropdown = presetManager.createDropdown(new DropdownParam(this.l('variables.operation.tooltip'), ChangeVariable.operatorOptions(this.roomEvents.localization), () => this.onChangeOperator(), this.l('variables.operation.advanced')));
        this._section2 = presetManager.createSection(this.l('variables.operation'), this._operatorDropdown);
        this._section3 = presetManager.createValueOrVariableSection(1, this.mergedSourceOptions(1), this.l('variables.reference_value'), -2147483648, 2147483647);
        builder.addElements(this._section1, this._section2, this._section3);
    }

    // AS3: _SafeCls_4139.as::mergedSelectionTitle()
    override mergedSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.merged.title.variables_destination';
        }

        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4139.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0], [1, 1]];
    }

    // AS3: _SafeCls_4139.as::setMergedType()
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

    // AS3: _SafeCls_4139.as::getMergedType()
    override getMergedType(id: number): number
    {
        if(id === 0)
        {
            return this._target;
        }

        return this._section3.target;
    }

    // AS3: _SafeCls_4139.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4139.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4139.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4139.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
