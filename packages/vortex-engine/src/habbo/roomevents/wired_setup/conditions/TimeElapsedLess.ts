import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * TimeElapsedLess — the "less than N seconds have elapsed" wired condition: a single time slider
 * (1..1200, shown as pulses), stored as intParams [seconds]. The slider is 0-based internally (value
 * + 1 on the wire).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4196`; the name follows the code it returns
 * (ConditionCodes.TIME_ELAPSED_LESS).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4196.as
 */
export class TimeElapsedLess extends DefaultConditionType
{
    // AS3: _SafeCls_4196.as::_time
    private _time!: SliderSection;

    // AS3: _SafeCls_4196.as::get code()
    override get code(): number
    {
        return ConditionCodes.TIME_ELAPSED_LESS;
    }

    // AS3: _SafeCls_4196.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4196.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.allowbefore2', '', SliderSection.CONVERTER_PULSES, 1, 1200, 1);
        this._time.value = 1;

        builder.addElements(this._time);
    }

    // AS3: _SafeCls_4196.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._time.value = def.intParams[0] - 1;
    }

    // AS3: _SafeCls_4196.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._time.value + 1];
    }
}
