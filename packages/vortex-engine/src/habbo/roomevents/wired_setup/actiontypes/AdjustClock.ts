import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValuePulses} from '../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * AdjustClock — the "adjust clock furni" wired action: a seconds slider (0..119, shown as pulses), a
 * minutes slider (0..99) and a set/increase/decrease operator. The seconds slider packs both the raw
 * seconds count and the sub-pulse bit, stored as intParams [seconds, minutes, subPulse, operator].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4279`; the name follows the code it returns
 * (ActionTypeCodes.ADJUST_CLOCK).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4279.as
 */
export class AdjustClock extends DefaultActionType
{
    // AS3: _SafeCls_4279.as::_seconds
    private _seconds!: SliderSection;

    // AS3: _SafeCls_4279.as::_minutes
    private _minutes!: SliderSection;

    // AS3: _SafeCls_4279.as::_operator
    private _operator!: RadioGroupPreset;

    // AS3: _SafeCls_4279.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.ADJUST_CLOCK;
    }

    // AS3: _SafeCls_4279.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4279.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._seconds = presetManager.createSliderSection('wiredfurni.params.clock_seconds', 'seconds', new SliderValuePulses(), 0, 119, 1, false);
        this._minutes = presetManager.createSliderSection('wiredfurni.params.clock_minutes', 'minutes', SliderSection.CONVERTER_ECHO, 0, 99, 1, false);
        this._operator = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('operator.0')),
            new RadioButtonParam(1, this.l('operator.1')),
            new RadioButtonParam(2, this.l('operator.2'))
        ]);

        builder.addElements(presetManager.createSection(this.l('choose_type'), this._operator), this._minutes, this._seconds);
    }

    // AS3: _SafeCls_4279.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const seconds = Math.trunc(def.getInt(0));
        const minutes = Math.trunc(def.getInt(1));
        const subPulse = Math.trunc(def.getInt(2));

        this._seconds.value = seconds * 2 + subPulse;
        this._minutes.value = minutes;
        this._operator.selected = def.getInt(3);
    }

    // AS3: _SafeCls_4279.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const packed = this._seconds.value;
        const seconds = Math.floor(packed / 2);
        const subPulse = packed % 2;

        return [seconds, this._minutes.value, subPulse, this._operator.selected];
    }
}
