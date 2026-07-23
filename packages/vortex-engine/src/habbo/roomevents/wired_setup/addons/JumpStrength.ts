import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * JumpStrength — the "jump strength" wired addon: a single value-or-variable section (-1000..1000)
 * giving the strength either as a literal number or from a wired variable (global/context sources).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4247`; the name follows the code it returns
 * (AddonCodes.JUMP_STRENGTH).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4247.as
 */
export class JumpStrength extends DefaultAddonType
{
    // AS3: _SafeCls_4247.as::_section1
    private _section1!: ValueOrVariableSection;

    // AS3: _SafeCls_4247.as::get code()
    override get code(): number
    {
        return AddonCodes.JUMP_STRENGTH;
    }

    // AS3: _SafeCls_4247.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._section1.option);
        params.push(this._section1.numberValue);
        params.push(this._section1.target);

        return params;
    }

    // AS3: _SafeCls_4247.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._section1.finalizeSelection];
    }

    // AS3: _SafeCls_4247.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let variableId = def.variableIds[0];
        const option = def.getInt(0);
        let value = def.getInt(1);
        const target = def.getInt(2);

        if(option === 0)
        {
            variableId = WiredVariable.DEFAULT_VARIABLE_ID;
        }
        else
        {
            value = 80;
        }

        this._section1.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
    }

    // AS3: _SafeCls_4247.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._section1.onEditInitialized();
    }

    // AS3: _SafeCls_4247.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4247.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._section1 = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.jump_strength}', -1000, 1000);
        builder.addElements(this._section1);
    }

    // AS3: _SafeCls_4247.as::isInputSourceDisabled()
    override isInputSourceDisabled(_a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            return this._section1.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: _SafeCls_4247.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: _SafeCls_4247.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4247.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._section1.target = b;
    }

    // AS3: _SafeCls_4247.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._section1.target;
    }

    // AS3: _SafeCls_4247.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4247.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4247.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4247.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
