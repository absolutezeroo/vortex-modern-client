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
 * TeamHasScore — the "a team has a compared score" wired condition: a team selector (triggerer/1..4),
 * a comparison operator and a score slider (0..1000), stored as intParams [team, score, comparison].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/TeamHasScore.as
 */
export class TeamHasScore extends DefaultConditionType
{
    // AS3: TeamHasScore.as::_team
    private _team!: RadioGroupPreset;

    // AS3: TeamHasScore.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: TeamHasScore.as::_score
    private _score!: SliderSection;

    // AS3: TeamHasScore.as::get code()
    override get code(): number
    {
        return ConditionCodes.TEAM_HAS_SCORE;
    }

    // AS3: TeamHasScore.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: TeamHasScore.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('team.triggerer'), null, null, true),
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);
        this._score = presetManager.createSliderSection('wiredfurni.params.setscore2', 'points', new SliderValueEcho(), 0, 1000, 1);
        this._score.value = 1;

        builder.addElements(presetManager.createSection(this.l('team'), this._team), presetManager.createSection(this.l('comparison_selection'), this._comparison), this._score);
    }

    // AS3: TeamHasScore.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._team.selected = def.intParams[0];
        this._score.value = def.intParams[1];
        this._comparison.selected = def.intParams[2];
    }

    // AS3: TeamHasScore.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._team.selected, this._score.value, this._comparison.selected];
    }
}
