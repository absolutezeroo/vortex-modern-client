import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * UsersInTeam — the "users belonging to a team" wired selector: an any/1..4 team selector (two
 * columns), stored as intParams [team].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4216`; the name follows the code it returns
 * (SelectorCodes.USERS_IN_TEAM).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4216.as
 */
export class UsersInTeam extends DefaultSelectorType
{
    // AS3: _SafeCls_4216.as::_team
    private _team!: RadioGroupPreset;

    // AS3: _SafeCls_4216.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_IN_TEAM;
    }

    // AS3: _SafeCls_4216.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4216.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._team = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('team.any'), null, null, true),
            new RadioButtonParam(1, this.l('team.1')),
            new RadioButtonParam(2, this.l('team.2')),
            new RadioButtonParam(3, this.l('team.3')),
            new RadioButtonParam(4, this.l('team.4'))
        ], null, 2);
        const section = presetManager.createSection(this.l('team'), this._team);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4216.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._team.selected = def.intParams[0];
    }

    // AS3: _SafeCls_4216.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._team.selected];
    }
}
