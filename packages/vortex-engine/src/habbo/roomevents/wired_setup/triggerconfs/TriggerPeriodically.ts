import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValuePulses} from '../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * TriggerPeriodically — the "trigger periodically" wired trigger: a single interval slider (1..120,
 * shown as pulses), stored as intParams [pulses]. Base of TriggerPeriodicallyLong (which only swaps
 * the converter).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4050`; the name follows the code it returns
 * (TriggerConfCodes.TRIGGER_PERIODICALLY), matching the 2016 PRODUCTION TriggerPeriodically.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4050.as
 */
export class TriggerPeriodically extends DefaultTriggerConf
{
    // AS3: _SafeCls_4050.as::_time (AS3 TriggerPeriodicallyLong re-declares its own; the port shares
    // this protected field since the subclass only differs in buildInputs)
    protected _time!: SliderSection;

    // AS3: _SafeCls_4050.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.TRIGGER_PERIODICALLY;
    }

    // AS3: _SafeCls_4050.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._time.value];
    }

    // AS3: _SafeCls_4050.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4050.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.settime3', '', new SliderValuePulses(), 1, 120, 1);
        this._time.value = 1;

        builder.addElements(this._time);
    }

    // AS3: _SafeCls_4050.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._time.value = def.intParams[0];
    }
}
