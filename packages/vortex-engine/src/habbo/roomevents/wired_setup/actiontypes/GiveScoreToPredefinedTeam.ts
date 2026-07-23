import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {GiveScore} from './GiveScore';

/**
 * GiveScoreToPredefinedTeam — the "give score to a predefined team" wired action: GiveScore plus a
 * two-column team selector (teams 1..4), stored as an extra intParam.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4136`; the name follows the code it returns
 * (ActionTypeCodes.GIVE_SCORE_TO_PREDEFINED_TEAM).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4136.as
 */
export class GiveScoreToPredefinedTeam extends GiveScore
{
    // AS3: _SafeCls_4136.as::_team
    private _team!: RadioGroupPreset;

    // AS3: _SafeCls_4136.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_SCORE_TO_PREDEFINED_TEAM;
    }

    // AS3: _SafeCls_4136.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        super.buildInputs(presetManager, wiredStyle, builder);

        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);

        const section = presetManager.createSection(this.l('team'), this._team);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4136.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._team.selected = def.getInt(2);
    }

    // AS3: _SafeCls_4136.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params = super.readIntParamsFromForm();

        params.push(this._team.selected);

        return params;
    }
}
