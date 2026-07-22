import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * ActionPicker — the "skip and pick actions" wired addon: a skip-actions slider (0..100) and a
 * pick-amount slider (1..100), stored as intParams [skips, picks].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4334`; the name follows its skipactions/
 * pickamount behaviour (code AddonCodes.ACTION_PICKER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4334.as
 */
export class ActionPicker extends DefaultAddonType
{
    // AS3: _SafeCls_4334.as::_skips
    private _skips!: SliderSection;

    // AS3: _SafeCls_4334.as::_picks
    private _picks!: SliderSection;

    // AS3: _SafeCls_4334.as::get code()
    override get code(): number
    {
        return AddonCodes.ACTION_PICKER;
    }

    // AS3: _SafeCls_4334.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4334.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._skips.value, this._picks.value];
    }

    // AS3: _SafeCls_4334.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._skips.value = def.intParams[0];
        this._picks.value = def.intParams[1];
    }

    // AS3: _SafeCls_4334.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._skips = presetManager.createSliderSection('wiredfurni.params.skipactions', 'skips', SliderSection.CONVERTER_ECHO, 0, 100, 1, false);
        this._picks = presetManager.createSliderSection('wiredfurni.params.pickamount', 'picks', SliderSection.CONVERTER_ECHO, 1, 100, 1, false);

        builder.addElements(this._picks, this._skips);
    }
}
