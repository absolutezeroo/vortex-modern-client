import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * UserCountIn — the "the room's user count is within a range" wired condition: a min slider and a max
 * slider (0..125), stored as intParams [min, max]. Exposes the negation (NOT_USER_COUNT_IN).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4388`; the name follows the code it returns
 * (ConditionCodes.USER_COUNT_IN).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4388.as
 */
export class UserCountIn extends DefaultConditionType
{
    // AS3: _SafeCls_4388.as::_min
    private _min!: SliderSection;

    // AS3: _SafeCls_4388.as::_max
    private _max!: SliderSection;

    // AS3: _SafeCls_4388.as::get code()
    override get code(): number
    {
        return ConditionCodes.USER_COUNT_IN;
    }

    // AS3: _SafeCls_4388.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_USER_COUNT_IN;
    }

    // AS3: _SafeCls_4388.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4388.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._min = presetManager.createSliderSection('wiredfurni.params.usercountmin', 'value', new SliderValueEcho(), 0, 125, 1, false);
        this._max = presetManager.createSliderSection('wiredfurni.params.usercountmax', 'value', new SliderValueEcho(), 0, 125, 1, false);

        builder.addElements(this._min, this._max);
    }

    // AS3: _SafeCls_4388.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._min.value = def.getInt(0);
        this._max.value = def.getInt(1);
    }

    // AS3: _SafeCls_4388.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._min.value, this._max.value];
    }
}
