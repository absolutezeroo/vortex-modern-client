import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

/**
 * ContextVariable — the context-scoped variable declaration: a variable name and a "has value" option.
 * Stored as the variable name (string) plus intParams [hasValue].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4417`; the name follows its CONTEXT holder type
 * (code VariableCodes.CONTEXT_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4417.as
 */
export class ContextVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4417.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4417.as::_settings
    private _settings!: CheckboxGroupPreset;

    // AS3: _SafeCls_4417.as::get code()
    override get code(): number
    {
        return VariableCodes.CONTEXT_VARIABLE;
    }

    // AS3: _SafeCls_4417.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._settings.optionById(0).selected ? 1 : 0];
    }

    // AS3: _SafeCls_4417.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._settings.optionById(0).selected = def.intParams[0] !== 0;
        this.initialVariableName = def.stringParam;
    }

    // AS3: _SafeCls_4417.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: _SafeCls_4417.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4417.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._settings = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('variables.settings.has_value'))]);
        const settingsSection = presetManager.createSection(this.l('variables.settings'), this._settings);

        builder.addElements(this._variableName, settingsSection);
    }

    // AS3: _SafeCls_4417.as::variableType()
    override variableType(): number
    {
        return WiredVariableHolderType.CONTEXT;
    }

    // AS3: _SafeCls_4417.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection | null
    {
        return this._variableName;
    }
}
