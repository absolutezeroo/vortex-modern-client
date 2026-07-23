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
 * TeamIsWinning — the "a team is at a given placement" wired condition: a team selector
 * (triggerer/1..4) and a placement selector (1st..4th), stored as intParams [team, placement].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4226`; the name follows the code it returns
 * (ConditionCodes.TEAM_IS_WINNING).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4226.as
 */
export class TeamIsWinning extends DefaultConditionType
{
    // AS3: _SafeCls_4226.as::_team
    private _team!: RadioGroupPreset;

    // AS3: _SafeCls_4226.as::_placement
    private _placement!: RadioGroupPreset;

    // AS3: _SafeCls_4226.as::get code()
    override get code(): number
    {
        return ConditionCodes.TEAM_IS_WINNING;
    }

    // AS3: _SafeCls_4226.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4226.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('team.triggerer'), null, null, true),
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);
        this._placement = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('placement.1')),
            new RadioButtonParam(1, this.l('placement.2')),
            new RadioButtonParam(2, this.l('placement.3')),
            new RadioButtonParam(3, this.l('placement.4'))
        ], null, 4);

        builder.addElements(presetManager.createSection(this.l('team'), this._team), presetManager.createSection(this.l('placement_selection'), this._placement));
    }

    // AS3: _SafeCls_4226.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._team.selected = def.getInt(0);
        this._placement.selected = def.getInt(1);
    }

    // AS3: _SafeCls_4226.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._team.selected, this._placement.selected];
    }
}
