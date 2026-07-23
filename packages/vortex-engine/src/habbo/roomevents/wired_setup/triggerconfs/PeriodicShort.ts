import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueMilliseconds50} from '../common/slider_converter/SliderValueMilliseconds50';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * PeriodicShort — the "trigger periodically (short interval)" wired trigger: a single interval slider
 * (1..10, shown in 50ms steps), stored as intParams [steps].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4376`; the name follows the code it returns
 * (TriggerConfCodes.PERIODIC_SHORT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4376.as
 */
export class PeriodicShort extends DefaultTriggerConf
{
    // AS3: _SafeCls_4376.as::_time
    private _time!: SliderSection;

    // AS3: _SafeCls_4376.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.PERIODIC_SHORT;
    }

    // AS3: _SafeCls_4376.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._time.value];
    }

    // AS3: _SafeCls_4376.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4376.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.setshorttime', 'ms', new SliderValueMilliseconds50(), 1, 10, 1, false);
        this._time.value = 1;

        builder.addElements(this._time);
    }

    // AS3: _SafeCls_4376.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._time.value = def.getInt(0);
    }
}
