import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SourceTypeSelectorParam} from '../uibuilder/params/SourceTypeSelectorParam';
import type {CheckboxOptionPreset} from '../uibuilder/presets/CheckboxOptionPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import type {VariablePickerPreset} from '../uibuilder/presets/VariablePickerPreset';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * GiveVariable — the "set/give a wired variable a value" action: a variable picker (creatable/deletable
 * variables) + an "override existing" checkbox, plus an initial-value number input (disabled unless the
 * variable can hold a value). The variable id goes to variableIds[0]; target/value(long)/override to
 * intParams.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4067`; the name follows the code it returns
 * (ActionTypeCodes.GIVE_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4067.as
 */
export class GiveVariable extends DefaultActionType
{
    // AS3: _SafeCls_4067.as::_picker
    private _picker!: VariablePickerPreset;

    // AS3: _SafeCls_4067.as::_overrideVariable
    private _overrideVariable!: CheckboxOptionPreset;

    // AS3: _SafeCls_4067.as::_SafeStr_4909 (name derived: the initial-value input)
    private _initialValueInput!: NamedNumberInputPreset;

    // AS3: _SafeCls_4067.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_4067.as::_section2
    private _section2!: SectionPreset;

    // AS3: _SafeCls_4067.as::_SafeStr_5920 (name derived: the current variable target)
    private _target: number = 0;

    // AS3: _SafeCls_4067.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.canCreateAndDelete;
    }

    // AS3: _SafeCls_4067.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_VARIABLE;
    }

    // AS3: _SafeCls_4067.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._target);
        Util.pushIntAsLong(params, this._initialValueInput.value);
        params.push(this._overrideVariable.selected ? 1 : 0);

        return params;
    }

    // AS3: _SafeCls_4067.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._picker.finalizeSelection];
    }

    // AS3: _SafeCls_4067.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        this._target = def.getInt(0);
        let value = def.getInt(2);
        const override = def.getInt(3) !== 0;

        this._picker.init(def.wiredContext.roomVariablesList, variableId, this._target);

        const selected = this._picker.selected;
        const canWrite = selected !== null && selected.canWriteValue;

        if(!canWrite)
        {
            value = 0;
        }

        this.onVariableSelected(selected);
        this._overrideVariable.selected = override;
        this._initialValueInput.value = value;
    }

    // AS3: _SafeCls_4067.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.getSourceTypeSelector()!.select(this._target);
    }

    // AS3: _SafeCls_4067.as::onVariableSelected() — bound (passed as the picker's onSelect callback).
    private onVariableSelected = (variable: WiredVariable | null): void =>
    {
        this._section2.disabled = variable === null || !variable.hasValue;
    };

    // AS3: _SafeCls_4067.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4067.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const sourceTypeParam = new SourceTypeSelectorParam(this.mergedSourceOptions(0), this.createSourceTypeListener(0));
        this._picker = presetManager.createVariablePicker(GiveVariable.variableSelectionFilter, this.onVariableSelected);
        this._overrideVariable = presetManager.createCheckboxOption(new CheckboxOptionParam(this.l('variables.value_settings.override_existing')));
        const list = presetManager.createSimpleListView(true, [this._picker, this._overrideVariable]);
        this._section1 = presetManager.createSection(this.l('variables.variable_selection'), list, new SectionParam(sourceTypeParam));
        this._initialValueInput = presetManager.createNamedNumberInput(new NumberInputParam(0, -2147483648, 2147483647), this.l('variables.value_settings.initial_value'));
        this._section2 = presetManager.createSection(this.l('variables.value_settings'), this._initialValueInput);
        builder.addElements(this._section1, this._section2);
    }

    // AS3: _SafeCls_4067.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_destination';
    }

    // AS3: _SafeCls_4067.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4067.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._target = b;
        this._picker.variableTarget = this._target;
    }

    // AS3: _SafeCls_4067.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4067.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4067.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._target;
    }

    // AS3: _SafeCls_4067.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4067.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
