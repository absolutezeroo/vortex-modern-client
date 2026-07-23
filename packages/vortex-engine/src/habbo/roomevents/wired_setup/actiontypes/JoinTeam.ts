import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * JoinTeam — the "join team" wired action: a team selector (teams 1..4, two columns) and a join-type
 * selector (team_type.0..2), stored as intParams [team, type].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4361`; the name follows the code it returns
 * (ActionTypeCodes.JOIN_TEAM).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4361.as
 */
export class JoinTeam extends DefaultActionType
{
    // AS3: _SafeCls_4361.as::_team
    private _team!: RadioGroupPreset;

    // AS3: _SafeCls_4361.as::_type
    private _type!: RadioGroupPreset;

    // AS3: _SafeCls_4361.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.JOIN_TEAM;
    }

    // AS3: _SafeCls_4361.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4361.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);
        const teamSection = presetManager.createSection(this.l('team'), this._team);

        this._type = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('team_type.0')),
            new RadioButtonParam(1, this.l('team_type.1')),
            new RadioButtonParam(2, this.l('team_type.2'))
        ]);
        const typeSection = presetManager.createSection(this.l('choose_type'), this._type);

        builder.addElements(teamSection, typeSection);
    }

    // AS3: _SafeCls_4361.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._team.selected = def.getInt(0);
        this._type.selected = def.getInt(1);
    }

    // AS3: _SafeCls_4361.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._team.selected, this._type.selected];
    }
}
