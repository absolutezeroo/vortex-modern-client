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
 * FurniVariable — the furni-scoped variable declaration: a variable name, a "has value" option and an
 * availability selector (1/10). Stored as the variable name (string) plus intParams [hasValue,
 * availability].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4145`; the name follows its FURNI holder type
 * (code VariableCodes.FURNI_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4145.as
 */
export class FurniVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4145.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4145.as::_availability
    private _availability!: RadioGroupPreset;

    // AS3: _SafeCls_4145.as::_settings
    private _settings!: CheckboxGroupPreset;

    // AS3: _SafeCls_4145.as::get code()
    override get code(): number
    {
        return VariableCodes.FURNI_VARIABLE;
    }

    // AS3: _SafeCls_4145.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._settings.optionById(0).selected ? 1 : 0, this._availability.selected];
    }

    // AS3: _SafeCls_4145.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._settings.optionById(0).selected = def.getInt(0) !== 0;
        this._availability.selected = Math.trunc(def.getInt(1));
        this.initialVariableName = def.stringParam;
    }

    // AS3: _SafeCls_4145.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: _SafeCls_4145.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4145.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._settings = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.settings.has_value'))]);
        const settingsSection = presetManager.createSection(this.l('variables.settings'), this._settings);
        this._availability = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('variables.availability.1')),
            new RadioButtonParam(10, this.l('variables.availability.10'))
        ]);
        const availabilitySection = presetManager.createSection(this.l('variables.availability'), this._availability);

        builder.addElements(this._variableName, settingsSection, availabilitySection);
    }

    // AS3: _SafeCls_4145.as::variableType()
    override variableType(): number
    {
        return WiredVariableHolderType.FURNI;
    }

    // AS3: _SafeCls_4145.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection | null
    {
        return this._variableName;
    }
}
