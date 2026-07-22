import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ChooseVariableSection} from '../uibuilder/presets/sections/ChooseVariableSection';
import type {PlaceholderNameSection} from '../uibuilder/presets/sections/PlaceholderNameSection';
import type {VariablePlaceholderModeSection} from '../uibuilder/presets/sections/VariablePlaceholderModeSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * VariableCapturer — the "capture a variable into a placeholder" wired addon: a placeholder-name
 * section, a choose-variable section (variables that hold a writable value), and a text/value
 * placeholder-mode section (the text option is disabled unless the variable has a text connector).
 * Name goes to stringParam; the captured variable id to variableIds[0]; text-mode to intParams[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4011`; the name follows the code it returns
 * (AddonCodes.VARIABLE_CAPTURER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4011.as
 */
export class VariableCapturer extends DefaultAddonType
{
    // AS3: _SafeCls_4011.as::_SafeStr_6038 (name derived: the placeholder-name section)
    private _placeholderName!: PlaceholderNameSection;

    // AS3: _SafeCls_4011.as::_SafeStr_5259 (name derived: the choose-variable section)
    private _chooseVariable!: ChooseVariableSection;

    // AS3: _SafeCls_4011.as::_SafeStr_6479 (name derived: the placeholder-mode section)
    private _modeSection!: VariablePlaceholderModeSection;

    // AS3: _SafeCls_4011.as::_SafeStr_7007 (name derived: the currently captured variable)
    private _currentVariable: WiredVariable | null = null;

    // AS3: _SafeCls_4011.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.hasValue && variable.canCreateAndDelete && variable.canWriteValue;
    }

    // AS3: _SafeCls_4011.as::prettifiedName()
    private static prettifiedName(variable: WiredVariable | null): string
    {
        if(variable === null)
        {
            return '';
        }

        return Util.flatVariableName(variable);
    }

    // AS3: _SafeCls_4011.as::get code()
    override get code(): number
    {
        return AddonCodes.VARIABLE_CAPTURER;
    }

    // AS3: _SafeCls_4011.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4011.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._placeholderName = presetManager.createPlaceholderNameSection(this.l('texts.capturer_name'), '#');
        this._chooseVariable = presetManager.createChooseVariableSection(0, null, VariableCapturer.variableSelectionFilter, this.onChangeVariable);
        this._modeSection = presetManager.createVariablePlaceholderModeSection(this.l('texts.variable_input_type'));
        builder.addElements(this._placeholderName, this._chooseVariable, this._modeSection);
    }

    // AS3: _SafeCls_4011.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split('\t');
        const placeholderName = parts[0];
        const variableId = def.variableIds[0];
        const isTextMode = def.getBoolean(0);

        this._modeSection.isTextMode = isTextMode;
        this._placeholderName.placeholderName = placeholderName;
        this._chooseVariable.init(def.wiredContext.roomVariablesList, variableId, VariableExtraSourceTypes.CONTEXT_SOURCE);
        this._currentVariable = this._chooseVariable.selected;
        this.onChangeVariable(this._chooseVariable.selected);
    }

    // AS3: _SafeCls_4011.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._chooseVariable.onEditInitialized();
    }

    // AS3: _SafeCls_4011.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._modeSection.isTextMode ? 1 : 0];
    }

    // AS3: _SafeCls_4011.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._placeholderName.placeholderName;
    }

    // AS3: _SafeCls_4011.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._chooseVariable.finalizeSelection];
    }

    // AS3: _SafeCls_4011.as::onChangeVariable() — bound (passed as the choose-section's onSelect).
    private onChangeVariable = (variable: WiredVariable | null): void =>
    {
        const noTextConnector = variable === null || !variable.hasTextConnector;
        this._modeSection.radioAt(1).disabled = noTextConnector;

        if(noTextConnector)
        {
            this._modeSection.isTextMode = false;
        }

        if(this._placeholderName.placeholderName === '' || (this._currentVariable !== null && VariableCapturer.prettifiedName(this._currentVariable) === this._placeholderName.placeholderName))
        {
            this._placeholderName.placeholderName = VariableCapturer.prettifiedName(variable);
        }

        this._currentVariable = variable;
    };
}
