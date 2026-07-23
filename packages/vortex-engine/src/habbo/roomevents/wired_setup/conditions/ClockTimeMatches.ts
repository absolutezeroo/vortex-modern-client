import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import {SliderValuePulses} from '../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * ClockTimeMatches — the "the clock's elapsed time compares to a value" wired condition: a seconds
 * slider (0..119, as pulses), a minutes slider (0..99) and a comparison operator. The seconds slider
 * packs both the seconds count and the sub-pulse bit, stored as intParams
 * [seconds, minutes, subPulse, comparison].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/ClockTimeMatches.as
 */
export class ClockTimeMatches extends DefaultConditionType
{
    // AS3: ClockTimeMatches.as::_seconds
    private _seconds!: SliderSection;

    // AS3: ClockTimeMatches.as::_minutes
    private _minutes!: SliderSection;

    // AS3: ClockTimeMatches.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: ClockTimeMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.CLOCK_TIME_MATCHES;
    }

    // AS3: ClockTimeMatches.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ClockTimeMatches.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._seconds = presetManager.createSliderSection('wiredfurni.params.clock_seconds_elapsed', 'seconds', new SliderValuePulses(), 0, 119, 1, false);
        this._minutes = presetManager.createSliderSection('wiredfurni.params.clock_minutes_elapsed', 'minutes', new SliderValueEcho(), 0, 99, 1, false);
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);

        builder.addElements(presetManager.createSection(this.l('comparison_selection'), this._comparison), this._minutes, this._seconds);
    }

    // AS3: ClockTimeMatches.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const seconds = Math.trunc(def.getInt(0));
        const minutes = Math.trunc(def.getInt(1));
        const subPulse = Math.trunc(def.getInt(2));

        this._seconds.value = seconds * 2 + subPulse;
        this._minutes.value = minutes;
        this._comparison.selected = def.getInt(3);
    }

    // AS3: ClockTimeMatches.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const packed = this._seconds.value;
        const seconds = Math.floor(packed / 2);
        const subPulse = packed % 2;

        return [seconds, this._minutes.value, subPulse, this._comparison.selected];
    }
}
