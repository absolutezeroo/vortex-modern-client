import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * TriggerOnce — the "trigger once after a delay" wired trigger: a single time slider (1..1200, shown
 * as pulses), stored as intParams [pulses].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/TriggerOnce.as
 */
export class TriggerOnce extends DefaultTriggerConf
{
    // AS3: TriggerOnce.as::_time
    private _time!: SliderSection;

    // AS3: TriggerOnce.as::getSecsFromPulses()
    public static getSecsFromPulses(pulses: number): string
    {
        const seconds = Math.floor(pulses / 2);

        if(pulses % 2 === 0)
        {
            return '' + seconds;
        }

        return seconds + '.5';
    }

    // AS3: TriggerOnce.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.TRIGGER_ONCE;
    }

    // AS3: TriggerOnce.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: TriggerOnce.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.settime2', '', SliderSection.CONVERTER_PULSES, 1, 1200, 1);

        builder.addElements(this._time);
    }

    // AS3: TriggerOnce.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._time.value = def.getInt(0);
    }

    // AS3: TriggerOnce.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._time.value];
    }
}
