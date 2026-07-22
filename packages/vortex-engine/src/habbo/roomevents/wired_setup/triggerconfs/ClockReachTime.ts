import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import {SliderValuePulses} from '../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * ClockReachTime — the "the clock reaches a time" wired trigger: a seconds slider (0..119, as pulses)
 * and a minutes slider (0..99). The seconds slider packs both the seconds count and the sub-pulse bit,
 * stored as intParams [seconds, minutes, subPulse].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/ClockReachTime.as
 */
export class ClockReachTime extends DefaultTriggerConf
{
    // AS3: ClockReachTime.as::_seconds
    private _seconds!: SliderSection;

    // AS3: ClockReachTime.as::_sliderMinutes
    private _minutes!: SliderSection;

    // AS3: ClockReachTime.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.CLOCK_REACH_TIME;
    }

    // AS3: ClockReachTime.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const packed = this._seconds.value;
        const seconds = Math.floor(packed / 2);
        const subPulse = packed % 2;

        return [seconds, this._minutes.value, subPulse];
    }

    // AS3: ClockReachTime.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ClockReachTime.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._seconds = presetManager.createSliderSection('wiredfurni.params.clock_seconds_elapsed', 'seconds', new SliderValuePulses(), 0, 119, 1, false);
        this._minutes = presetManager.createSliderSection('wiredfurni.params.clock_minutes_elapsed', 'minutes', new SliderValueEcho(), 0, 99, 1, false);

        builder.addElements(this._minutes, this._seconds);
    }

    // AS3: ClockReachTime.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const seconds = Math.trunc(def.intParams[0]);
        const minutes = Math.trunc(def.intParams[1]);
        const subPulse = Math.trunc(def.intParams[2]);

        this._seconds.value = seconds * 2 + subPulse;
        this._minutes.value = minutes;
    }
}
