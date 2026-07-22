import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueEcho} from '../common/slider_converter/SliderValueEcho';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * ScoreAchieved — the "a team reaches a score" wired trigger: a team selector (any/1..4) and a score
 * slider (1..1000), stored as intParams [score, team].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/ScoreAchieved.as
 */
export class ScoreAchieved extends DefaultTriggerConf
{
    // AS3: ScoreAchieved.as::_score
    private _score!: SliderSection;

    // AS3: ScoreAchieved.as::_team
    private _team!: RadioGroupPreset;

    // AS3: ScoreAchieved.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.SCORE_ACHIEVED;
    }

    // AS3: ScoreAchieved.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._score.value, this._team.selected];
    }

    // AS3: ScoreAchieved.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ScoreAchieved.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('team.any'), null, null, true),
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);
        this._score = presetManager.createSliderSection('wiredfurni.params.setscore2', 'points', new SliderValueEcho(), 1, 1000, 1);
        this._score.value = 1;

        builder.addElements(presetManager.createSection(this.l('team'), this._team), this._score);
    }

    // AS3: ScoreAchieved.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const score = Math.trunc(def.intParams[0]);
        const team = Math.trunc(def.intParams[1]);

        this._score.value = score;
        this._team.selected = team;
    }
}
