import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * CarryUsers — the "carry users along" wired addon: a carry-mode selector, stored as intParams [mode].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/CarryUsers.as
 */
export class CarryUsers extends DefaultAddonType
{
    // AS3: CarryUsers.as::carryUsersMode
    private _carryUsersMode!: RadioGroupPreset;

    // AS3: CarryUsers.as::get code()
    override get code(): number
    {
        return AddonCodes.CARRY_USERS;
    }

    // AS3: CarryUsers.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: CarryUsers.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [
            new RadioButtonParam(0, this.loc('wiredfurni.params.carry_mode.0')),
            new RadioButtonParam(1, this.loc('wiredfurni.params.carry_mode.1'))
        ];
        const group = presetManager.createRadioGroup(params);
        const section = presetManager.createSection(this.loc('wiredfurni.params.carry_mode'), group);

        builder.addElements(section);

        this._carryUsersMode = group;
    }

    // AS3: CarryUsers.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._carryUsersMode.selected];
    }

    // AS3: CarryUsers.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._carryUsersMode.selected = def.getInt(0);
    }

    // AS3: CarryUsers.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title.carry';
    }

    // AS3: CarryUsers.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
