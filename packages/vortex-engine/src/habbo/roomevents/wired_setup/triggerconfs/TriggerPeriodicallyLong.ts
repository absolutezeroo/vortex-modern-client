import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderValueSeconds5} from '../common/slider_converter/SliderValueSeconds5';
import {TriggerConfCodes} from './TriggerConfCodes';
import {TriggerPeriodically} from './TriggerPeriodically';

/**
 * TriggerPeriodicallyLong — the "trigger periodically (long interval)" wired trigger: TriggerPeriodically
 * with a coarser interval slider (5-second steps). onEditStart/readIntParamsFromForm are inherited (AS3
 * re-overrides them identically via its own field; the port reuses the shared protected `_time`).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4360`; the name follows the code it returns
 * (TriggerConfCodes.PERIODIC_LONG), matching the 2016 PRODUCTION TriggerPeriodicallyLong.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4360.as
 */
export class TriggerPeriodicallyLong extends TriggerPeriodically
{
    // AS3: _SafeCls_4360.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.PERIODIC_LONG;
    }

    // AS3: _SafeCls_4360.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.settime3', '', new SliderValueSeconds5(), 1, 120, 1);
        this._time.value = 1;

        builder.addElements(this._time);
    }
}
