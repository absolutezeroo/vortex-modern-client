import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

/**
 * UserVariable — the user-scoped variable declaration: a variable name, a "has value" option and an
 * availability selector (0/10/11). Stored as the variable name (string) plus intParams [availability,
 * hasValue]. Changing from a stored to a non-stored availability requires confirmation.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4367`; the name follows its USER holder type
 * (code VariableCodes.USER_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4367.as
 */
export class UserVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4367.as::_previousAvailability
    private _previousAvailability: number = -1;

    // AS3: _SafeCls_4367.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4367.as::_availability
    private _availability!: RadioGroupPreset;

    // AS3: _SafeCls_4367.as::_settings
    private _settings!: CheckboxGroupPreset;

    // AS3: _SafeCls_4367.as::get code()
    override get code(): number
    {
        return VariableCodes.USER_VARIABLE;
    }

    // AS3: _SafeCls_4367.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._availability.selected, this._settings.optionById(0).selected ? 1 : 0];
    }

    // AS3: _SafeCls_4367.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        const availability = Math.trunc(def.getInt(0));
        const hasValue = def.getInt(1) !== 0;
        this._settings.optionById(0).selected = hasValue;
        this._previousAvailability = availability;
        this._availability.selected = availability;
        this.initialVariableName = def.stringParam;
    }

    // AS3: _SafeCls_4367.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: _SafeCls_4367.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4367.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._settings = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.settings.has_value'))]);
        const settingsSection = presetManager.createSection(this.l('variables.settings'), this._settings);
        this._availability = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('variables.availability.0')),
            new RadioButtonParam(10, this.l('variables.availability.10')),
            new RadioButtonParam(11, this.l('variables.availability.11'))
        ]);
        const availabilitySection = presetManager.createSection(this.l('variables.availability'), this._availability);

        builder.addElements(this._variableName, settingsSection, availabilitySection);
    }

    // AS3: _SafeCls_4367.as::get requireConfirmation()
    override get requireConfirmation(): { title: string; body: string } | null
    {
        const changingFromStored = DefaultVariableType.isVariableStored(this._previousAvailability) && !DefaultVariableType.isVariableStored(this._availability.selected);

        if(changingFromStored)
        {
            return {
                title: '${wiredfurni.variables.availability_change.title}',
                body: '${wiredfurni.variables.availability_change.body}'
            };
        }

        return null;
    }

    // AS3: _SafeCls_4367.as::variableType()
    override variableType(): number
    {
        return WiredVariableHolderType.USER;
    }

    // AS3: _SafeCls_4367.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection | null
    {
        return this._variableName;
    }
}
