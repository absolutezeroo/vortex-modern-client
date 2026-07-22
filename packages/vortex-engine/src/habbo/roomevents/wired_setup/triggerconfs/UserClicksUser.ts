import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * UserClicksUser — the "an avatar clicks another avatar" wired trigger: two option checkboxes (block
 * the menu from opening / do not rotate), stored as a boolean intParam per checkbox.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4244`; the name follows the code it returns
 * (TriggerConfCodes.USER_CLICKS_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4244.as
 */
export class UserClicksUser extends DefaultTriggerConf
{
    // AS3: _SafeCls_4244.as::options
    private _options!: CheckboxGroupPreset;

    // AS3: _SafeCls_4244.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.USER_CLICKS_USER;
    }

    // AS3: _SafeCls_4244.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4244.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [
            new CheckboxOptionParam(this.loc('wiredfurni.params.click_user.block_menu_open')),
            new CheckboxOptionParam(this.loc('wiredfurni.params.click_user.do_not_rotate'))
        ];
        const group = presetManager.createCheckboxGroup(params);
        const section = presetManager.createSection(this.loc('wiredfurni.params.click_user.settings'), group);

        builder.addElements(section);

        this._options = group;
    }

    // AS3: _SafeCls_4244.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        for(let i = 0; i < this._options.numCheckboxes; i++)
        {
            this._options.optionById(i).selected = def.getBoolean(i);
        }
    }

    // AS3: _SafeCls_4244.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        for(let i = 0; i < this._options.numCheckboxes; i++)
        {
            params.push(this._options.optionById(i).selected ? 1 : 0);
        }

        return params;
    }
}
