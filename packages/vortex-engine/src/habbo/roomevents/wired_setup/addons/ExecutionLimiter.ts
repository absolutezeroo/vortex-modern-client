import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValuePulses} from '../common/slider_converter/SliderValuePulses';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * ExecutionLimiter — the "limit executions per time window" wired addon: an executions-amount slider
 * (1..100) and a time-window slider (1..20, as pulses), stored as intParams [amount, timeWindow].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4166`; the name follows its behaviour (code
 * AddonCodes.EXECUTION_LIMITER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4166.as
 */
export class ExecutionLimiter extends DefaultAddonType
{
    // AS3: _SafeCls_4166.as::_amount
    private _amount!: SliderSection;

    // AS3: _SafeCls_4166.as::_timeWindow
    private _timeWindow!: SliderSection;

    // AS3: _SafeCls_4166.as::get code()
    override get code(): number
    {
        return AddonCodes.EXECUTION_LIMITER;
    }

    // AS3: _SafeCls_4166.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4166.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._amount = presetManager.createSliderSection('wiredfurni.params.setexecutions', 'amount', SliderSection.CONVERTER_ECHO, 1, 100, 1, false);
        this._timeWindow = presetManager.createSliderSection('wiredfurni.params.settimewindow', 'timewindow', new SliderValuePulses(), 1, 20, 1, false);

        builder.addElements(this._amount, this._timeWindow);
    }

    // AS3: _SafeCls_4166.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._amount.value = def.getInt(0);
        this._timeWindow.value = def.getInt(1);
    }

    // AS3: _SafeCls_4166.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._amount.value, this._timeWindow.value];
    }
}
