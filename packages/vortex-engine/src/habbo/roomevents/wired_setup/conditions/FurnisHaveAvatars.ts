import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * FurnisHaveAvatars — the "the selected furnis have avatars on them" wired condition: a require-all /
 * require-any selector, stored as intParams [mode]. Base of FurnisHaveNoAvatars.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/FurnisHaveAvatars.as
 */
export class FurnisHaveAvatars extends DefaultConditionType
{
    // AS3: FurnisHaveAvatars.as::_mode (AS3 FurnisHaveNoAvatars re-declares its own; the port shares
    // this protected field since the subclass only differs in buildInputs)
    protected _mode!: RadioGroupPreset;

    // AS3: FurnisHaveAvatars.as::get code()
    override get code(): number
    {
        return ConditionCodes.FURNIS_HAVE_AVATARS;
    }

    // AS3: FurnisHaveAvatars.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: FurnisHaveAvatars.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._mode = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('requireall.2')),
            new RadioButtonParam(1, this.l('requireall.3'))
        ]);
        const section = presetManager.createSection(this.l('requireall'), this._mode);

        builder.addElements(section);
    }

    // AS3: FurnisHaveAvatars.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._mode.selected = def.getInt(0);
    }

    // AS3: FurnisHaveAvatars.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._mode.selected];
    }
}
