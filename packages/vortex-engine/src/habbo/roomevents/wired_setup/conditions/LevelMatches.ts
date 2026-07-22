import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * LevelMatches — the "the user's level compares to a value" wired condition: a level slider (1..30)
 * and a comparison operator, stored as intParams [level, comparison].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/LevelMatches.as
 */
export class LevelMatches extends DefaultConditionType
{
    // AS3: LevelMatches.as::_level
    private _level!: SliderSection;

    // AS3: LevelMatches.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: LevelMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.USER_LEVEL;
    }

    // AS3: LevelMatches.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: LevelMatches.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._level = presetManager.createSliderSection('wiredfurni.params.level_selection', 'level', new SliderValueEcho(), 1, 30, 1);
        this._level.value = 1;
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);

        builder.addElements(this._level, presetManager.createSection(this.l('comparison_selection'), this._comparison));
    }

    // AS3: LevelMatches.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._level.value = def.intParams[0];
        this._comparison.selected = def.intParams[1];
    }

    // AS3: LevelMatches.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._level.value, this._comparison.selected];
    }
}
