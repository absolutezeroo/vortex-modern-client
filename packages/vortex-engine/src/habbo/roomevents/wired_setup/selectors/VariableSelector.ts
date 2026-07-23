import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {CheckboxOptionPreset} from '../uibuilder/presets/CheckboxOptionPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * VariableSelector — abstract base for the "select furnis/users that have a variable" selectors: a
 * variable picker (scoped to the subclass's input source) + an optional "select by value" branch
 * (checkbox → comparison radio + value-or-variable section), whose visibility follows whether the
 * picked variable holds a value. Concrete subclasses supply the input source and the server code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4352.as
 */
export class VariableSelector extends DefaultSelectorType
{
    // AS3: _SafeCls_4352.as::_section1
    protected _section1!: SectionPreset;

    // AS3: _SafeCls_4352.as::_picker
    protected _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4352.as::_section2
    protected _section2!: SectionPreset;

    // AS3: _SafeCls_4352.as::_SafeStr_6127 (name derived: the "select by value" checkbox)
    protected _selectByValueCheckbox!: CheckboxOptionPreset;

    // AS3: _SafeCls_4352.as::_section3
    protected _section3!: SectionPreset;

    // AS3: _SafeCls_4352.as::_SafeStr_7857 (name derived: the comparison radio)
    protected _comparisonRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4352.as::_section4
    protected _section4!: ValueOrVariableSection;

    // AS3: _SafeCls_4352.as::variableSelectionFilter1()
    private static variableSelectionFilter1(_variable: WiredVariable): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4352.as::get variableSource() — the picker's source (overridden by subclasses).
    protected get variableSource(): number
    {
        return -1;
    }

    // AS3: _SafeCls_4352.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._comparisonRadio.selected);
        params.push(this._selectByValueCheckbox.selected ? this._section4.option + 1 : 0);
        Util.pushIntAsLong(params, this._section4.numberValue);
        params.push(this._section4.target);

        return params;
    }

    // AS3: _SafeCls_4352.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection, this._section4.finalizeSelection];
    }

    // AS3: _SafeCls_4352.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId0 = def.variableIds[0];
        let variableId1 = def.variableIds[1];
        const comparison = def.getInt(0);
        let mode = def.getInt(1);
        let value = def.getInt(3);
        const referenceTarget = def.getInt(4);

        this._picker.init(def.wiredContext.roomVariablesList, variableId0, this.variableSource);
        this._comparisonRadio.selected = comparison;

        if(mode === 0 || this._picker.selected === null || !this._picker.selected.hasValue)
        {
            variableId1 = WiredVariable.DEFAULT_VARIABLE_ID;
            value = 0;
            mode = 0;
            this._selectByValueCheckbox.selected = false;
        }
        else if(mode === 1)
        {
            variableId1 = WiredVariable.DEFAULT_VARIABLE_ID;
            this._selectByValueCheckbox.selected = true;
        }
        else
        {
            value = 0;
            this._selectByValueCheckbox.selected = true;
        }

        this._section4.init(def.wiredContext.roomVariablesList, variableId1, referenceTarget, mode - 1, value);
        this.setValueSelectionVisibility(this._picker.selected !== null && this._picker.selected.hasValue && mode > 0);
        this.onVariableSelected(this._picker.selected);
    }

    // AS3: _SafeCls_4352.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section4.onEditInitialized();
    }

    // AS3: _SafeCls_4352.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE && a === 0)
        {
            return this._section2.disabled || !this._selectByValueCheckbox.selected || this._section4.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: _SafeCls_4352.as::onVariableSelected() — bound (passed as the picker's onSelect callback).
    private onVariableSelected = (variable: WiredVariable | null): void =>
    {
        const hasValue = variable !== null && variable.hasValue;
        this._section2.disabled = !hasValue;
        this.setValueSelectionVisibility(hasValue && this._selectByValueCheckbox.selected);
    };

    // AS3: _SafeCls_4352.as::setValueSelectionVisibility()
    private setValueSelectionVisibility(visible: boolean): void
    {
        this._section3.disabled = !visible;
        this._section4.disabled = !visible;
        this.roomEvents.wiredCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 0);
    }

    // AS3: _SafeCls_4352.as::onSelectByValueChange() — the checkbox id is unused (AS3 ignores it).
    private onSelectByValueChange(_id: number, selected: boolean): void
    {
        this.setValueSelectionVisibility(selected);
    }

    // AS3: _SafeCls_4352.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4352.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._picker = presetManager.createVariablePicker(VariableSelector.variableSelectionFilter1, this.onVariableSelected);
        this._section1 = presetManager.createSection(this.l('variables.variable_selection'), this._picker);
        const checkboxGroup = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.value_settings.select_by_value'))], (id, selected) => this.onSelectByValueChange(id, selected));
        this._selectByValueCheckbox = checkboxGroup.optionById(0);
        this._section2 = presetManager.createSection(this.l('choose_type'), this._selectByValueCheckbox);
        this._comparisonRadio = presetManager.createRadioGroup([new RadioButtonParam(2, '>'), new RadioButtonParam(5, '≥'), new RadioButtonParam(1, '='), new RadioButtonParam(3, '≤'), new RadioButtonParam(0, '<'), new RadioButtonParam(4, '≠')], null, 6);
        this._section3 = presetManager.createSection(this.l('comparison_selection'), this._comparisonRadio);
        this._section4 = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), this.l('variables.reference_value'), -2147483648, 2147483647);
        builder.addElements(this._section1, this._section2, this._section3, this._section4);
    }

    // AS3: _SafeCls_4352.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4352.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4352.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._section4.target = b;
    }

    // AS3: _SafeCls_4352.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._section4.target;
    }

    // AS3: _SafeCls_4352.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4352.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4352.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4352.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
