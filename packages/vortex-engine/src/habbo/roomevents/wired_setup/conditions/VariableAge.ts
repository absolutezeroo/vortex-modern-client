import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * VariableAge — the "a variable's age matches" wired condition: pick a wired variable (that exposes a
 * creation or last-update time), choose which timestamp, a comparison, and a duration + time unit. The
 * variable id goes to variableIds[0]; the target/comparison/compare-value/duration(long)/time-unit to
 * intParams. Reference-value variables can be sourced from global/context via the merged-source picker.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4192`; the name follows the code it returns
 * (ConditionCodes.VARIABLE_AGE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4192.as
 */
export class VariableAge extends DefaultConditionType
{
    // AS3: _SafeCls_4192.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4192.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4192.as::_SafeStr_7844 (name derived: the comparison radio)
    private _comparisonRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4192.as::_SafeStr_6055 (name derived: the creation/last-update compare-value radio)
    private _compareValueRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4192.as::_SafeStr_7947 (name derived: the duration input)
    private _durationInput!: NamedNumberInputPreset;

    // AS3: _SafeCls_4192.as::_timeUnit
    private _timeUnit!: DropdownPreset;

    // AS3: _SafeCls_4192.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4192.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.canReadCreationTime || variable.canReadLastUpdateTime;
    }

    // AS3: _SafeCls_4192.as::get code()
    override get code(): number
    {
        return ConditionCodes.VARIABLE_AGE;
    }

    // AS3: _SafeCls_4192.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._target);
        params.push(this._comparisonRadio.selected);
        params.push(this._compareValueRadio.selected);
        Util.pushIntAsLong(params, this._durationInput.value);
        params.push(this._timeUnit.selectedId);

        return params;
    }

    // AS3: _SafeCls_4192.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection];
    }

    // AS3: _SafeCls_4192.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];

        this._target = def.getInt(0);
        this._picker.init(def.wiredContext.roomVariablesList, variableId, this._target);
        this._comparisonRadio.selected = def.getInt(1);
        this._compareValueRadio.selected = def.getInt(2);
        this._durationInput.value = def.getInt(4);
        this._timeUnit.selectedId = def.getInt(5);
        this.updateAgeOptions(this._picker.selected);
    }

    // AS3: _SafeCls_4192.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
    }

    // AS3: _SafeCls_4192.as::updateAgeOptions() — bound (passed as the picker's onSelect callback).
    private updateAgeOptions = (variable: WiredVariable | null): void =>
    {
        this._compareValueRadio.setOptionDisabled(0, false);
        this._compareValueRadio.setOptionDisabled(1, false);

        if(variable === null)
        {
            return;
        }

        if(!variable.canReadCreationTime)
        {
            this._compareValueRadio.setOptionDisabled(0, true);
        }
        else if(!variable.canReadLastUpdateTime)
        {
            this._compareValueRadio.setOptionDisabled(1, true);
        }
    };

    // AS3: _SafeCls_4192.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4192.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(VariableAge.variableSelectionFilter, this.updateAgeOptions);
        const sectionParam = new SectionParam(sourceTypeParam);
        this._section1 = presetManager.createSection(this.l('variables.variable_selection'), this._picker, sectionParam);

        this._compareValueRadio = presetManager.createRadioGroup([new RadioButtonParam(0, this.l('variables.compare_value.0')), new RadioButtonParam(1, this.l('variables.compare_value.1'))]);
        const compareValueSection = presetManager.createSection(this.l('variables.compare_value'), this._compareValueRadio);

        this._comparisonRadio = presetManager.createRadioGroup([new RadioButtonParam(0, this.l('comparison.0')), new RadioButtonParam(2, this.l('comparison.2'))]);
        const comparisonSection = presetManager.createSection(this.l('comparison_selection'), this._comparisonRadio);

        this._durationInput = presetManager.createNamedNumberInput(new NumberInputParam(0, -2147483648, 2147483647), this.l('variables.duration'));
        this._timeUnit = presetManager.createDropdown(new DropdownParam('', [
            new ExpandableDropdownOption(0, this.l('variables.duration.0')),
            new ExpandableDropdownOption(1, this.l('variables.duration.1')),
            new ExpandableDropdownOption(2, this.l('variables.duration.2')),
            new ExpandableDropdownOption(3, this.l('variables.duration.3')),
            new ExpandableDropdownOption(4, this.l('variables.duration.4')),
            new ExpandableDropdownOption(5, this.l('variables.duration.5')),
            new ExpandableDropdownOption(6, this.l('variables.duration.6')),
            new ExpandableDropdownOption(7, this.l('variables.duration.7'))
        ]));

        const spacing = presetManager.createSpacing(false, 5);
        const timeList = presetManager.createSimpleListView(false, [this._durationInput, spacing, this._timeUnit], true);
        const timeSection = presetManager.createSection(this.l('variables.time_selection'), timeList);

        builder.addElements(this._section1, compareValueSection, comparisonSection, timeSection);
    }

    // AS3: _SafeCls_4192.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4192.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables';
    }

    // AS3: _SafeCls_4192.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4192.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._target = b;
        this._picker.variableTarget = this._target;
    }

    // AS3: _SafeCls_4192.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._target;
    }

    // AS3: _SafeCls_4192.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4192.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4192.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
