import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * InputSourceQuantity — the "the number of input-source furnis/users compares to a value" wired
 * condition: a comparison operator and an amount slider (0..100). Whether the source is furni or user
 * is a merged-selection boolean, stored as intParams [userSource, amount, comparison].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4243`; the name follows the code it returns
 * (ConditionCodes.INPUT_SOURCE_QUANTITY).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4243.as
 */
export class InputSourceQuantity extends DefaultConditionType
{
    // AS3: _SafeCls_4243.as::_amount
    private _amount!: SliderSection;

    // AS3: _SafeCls_4243.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: _SafeCls_4243.as::_userSource
    private _userSource: boolean = false;

    // AS3: _SafeCls_4243.as::get code()
    override get code(): number
    {
        return ConditionCodes.INPUT_SOURCE_QUANTITY;
    }

    // AS3: _SafeCls_4243.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4243.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);
        const section = presetManager.createSection(this.l('comparison_selection'), this._comparison);
        this._amount = presetManager.createSliderSection('wiredfurni.params.setamount2', '', new SliderValueEcho(), 0, 100, 1);

        builder.addElements(section, this._amount);
    }

    // AS3: _SafeCls_4243.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._userSource = def.getBoolean(0);
        this._amount.value = def.getInt(1);
        this._comparison.selected = def.getInt(2);
    }

    // AS3: _SafeCls_4243.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._userSource ? 1 : 0, this._amount.value, this._comparison.selected];
    }

    // AS3: _SafeCls_4243.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 0]];
    }

    // AS3: _SafeCls_4243.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._userSource = b === WiredInputSourcePicker.USER_SOURCE;
    }

    // AS3: _SafeCls_4243.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._userSource ? WiredInputSourcePicker.USER_SOURCE : WiredInputSourcePicker.FURNI_SOURCE;
    }

    // AS3: _SafeCls_4243.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
