import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextPreset} from '../uibuilder/presets/TextPreset';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

/**
 * GlobalVariable — the global-scoped variable declaration: a variable name, a current-value inspection
 * line (fed from the wired context's global variable info) and an availability selector (1/10/11).
 * Stored as the variable name (string) plus intParams [availability].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4098`; the name follows its GLOBAL holder type
 * (code VariableCodes.GLOBAL_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4098.as
 */
export class GlobalVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4098.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4098.as::_availability
    private _availability!: RadioGroupPreset;

    // AS3: _SafeCls_4098.as::_inspectionText
    private _inspectionText!: TextPreset;

    // AS3: _SafeCls_4098.as::get code()
    override get code(): number
    {
        return VariableCodes.GLOBAL_VARIABLE;
    }

    // AS3: _SafeCls_4098.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._availability.selected];
    }

    // AS3: _SafeCls_4098.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._availability.selected = Math.trunc(def.getInt(0));
        this.initialVariableName = def.stringParam;

        const value = def.wiredContext.globalVariableInfo?.value ?? 0;
        this.roomEvents.localization.registerParameter('wiredfurni.params.variables.inspection.current_value', 'value', '' + value);
    }

    // AS3: _SafeCls_4098.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName;
    }

    // AS3: _SafeCls_4098.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4098.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._inspectionText = presetManager.createText(this.l('variables.inspection.current_value'));
        const inspectionSection = presetManager.createSection(this.l('variables.inspection'), this._inspectionText);
        this._availability = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('variables.availability.1')),
            new RadioButtonParam(10, this.l('variables.availability.10')),
            new RadioButtonParam(11, this.l('variables.availability.11'))
        ]);
        const availabilitySection = presetManager.createSection(this.l('variables.availability'), this._availability);

        builder.addElements(this._variableName, inspectionSection, availabilitySection);
    }

    // AS3: _SafeCls_4098.as::variableType()
    override variableType(): number
    {
        return WiredVariableHolderType.GLOBAL;
    }

    // AS3: _SafeCls_4098.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection | null
    {
        return this._variableName;
    }
}
