import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * AnimationTime — the "set the move animation duration" wired addon: a single time slider
 * (50..2000ms, 50ms steps), stored as intParams [ms].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/AnimationTime.as
 */
export class AnimationTime extends DefaultAddonType
{
    // AS3: AnimationTime.as::_time
    private _time!: SliderSection;

    // AS3: AnimationTime.as::get code()
    override get code(): number
    {
        return AddonCodes.ANIMATION_TIME;
    }

    // AS3: AnimationTime.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: AnimationTime.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._time = presetManager.createSliderSection('wiredfurni.params.setanimationtime2', '', SliderSection.CONVERTER_ECHO, 50, 2000, 50);

        builder.addElements(this._time);
    }

    // AS3: AnimationTime.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._time.value = def.getInt(0);
    }

    // AS3: AnimationTime.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._time.value];
    }
}
