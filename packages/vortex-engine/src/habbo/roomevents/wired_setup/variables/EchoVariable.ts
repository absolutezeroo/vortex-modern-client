import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {WiredVariableType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableType';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ChooseVariableSection} from '../uibuilder/presets/sections/ChooseVariableSection';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

/**
 * EchoVariable — a wired variable that mirrors ("echoes") another variable: a variable-name section
 * plus a choose-variable section (any non-plain variable, from furni/user/global/context sources). The
 * echoed variable id goes to variableIds[0]; the local name to stringParam. The name auto-fills from
 * the echoed variable's flat name while the user hasn't customised it.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4356`; the name follows the code it returns
 * (VariableCodes.ECHO_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4356.as
 */
export class EchoVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4356.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4356.as::_SafeStr_5259 (name derived: the choose-variable section)
    private _chooseVariable!: ChooseVariableSection;

    // AS3: _SafeCls_4356.as::_SafeStr_7007 (name derived: the currently echoed variable)
    private _currentVariable: WiredVariable | null = null;

    // AS3: _SafeCls_4356.as::variableSelectionFilter()
    private static variableSelectionFilter(variable: WiredVariable): boolean
    {
        return variable.variableType !== WiredVariableType.STANDARD;
    }

    // AS3: _SafeCls_4356.as::get code()
    override get code(): number
    {
        return VariableCodes.ECHO_VARIABLE;
    }

    // AS3: _SafeCls_4356.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4356.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._chooseVariable = presetManager.createChooseVariableSection(-1, [WiredInputSourcePicker.FURNI_SOURCE, WiredInputSourcePicker.USER_SOURCE, VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE], EchoVariable.variableSelectionFilter, this.onVariableSelected);
        builder.addElements(this._variableName, this._chooseVariable);
    }

    // AS3: _SafeCls_4356.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: _SafeCls_4356.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._chooseVariable.finalizeSelection];
    }

    // AS3: _SafeCls_4356.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const variableId = def.variableIds[0];
        let target = WiredInputSourcePicker.USER_SOURCE;
        const variable = Util.findVariableById(def.wiredContext.roomVariablesList?.variables ?? [], variableId);

        if(variable !== null)
        {
            target = variable.variableTarget;
        }

        this._chooseVariable.init(def.wiredContext.roomVariablesList, variableId, target);
        this._currentVariable = this._chooseVariable.selected;
        this.initialVariableName = def.stringParam;
    }

    // AS3: _SafeCls_4356.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._chooseVariable.onEditInitialized();
    }

    // AS3: _SafeCls_4356.as::onVariableSelected() — bound (passed as the choose-section's onSelect).
    private onVariableSelected = (variable: WiredVariable | null): void =>
    {
        if(this._variableName.variableName.length === 0 || (this._currentVariable !== null && this.defaultEchoVarName(this._currentVariable) === this._variableName.variableName))
        {
            this._variableName.variableName = variable === null ? '' : this.defaultEchoVarName(variable);
        }

        this._currentVariable = variable;
    };

    // AS3: _SafeCls_4356.as::defaultEchoVarName()
    private defaultEchoVarName(variable: WiredVariable): string
    {
        return Util.flatVariableName(variable);
    }

    // AS3: _SafeCls_4356.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection
    {
        return this._variableName;
    }

    // AS3: _SafeCls_4356.as::variableType()
    override variableType(): number
    {
        return this._chooseVariable.target;
    }
}
