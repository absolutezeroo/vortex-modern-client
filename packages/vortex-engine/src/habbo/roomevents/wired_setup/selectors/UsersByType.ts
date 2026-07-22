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
 * UsersByType — the "users of a given rights type" wired selector: an owner/rights/any selector, stored
 * as intParams [userType].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4427`; the name follows the code it returns
 * (SelectorCodes.USERS_BY_TYPE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4427.as
 */
export class UsersByType extends DefaultSelectorType
{
    // AS3: _SafeCls_4427.as::_userType
    private _userType!: RadioGroupPreset;

    // AS3: _SafeCls_4427.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_BY_TYPE;
    }

    // AS3: _SafeCls_4427.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4427.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._userType = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('usertype.1')),
            new RadioButtonParam(2, this.l('usertype.2')),
            new RadioButtonParam(4, this.l('usertype.4'))
        ]);
        this._userType.selected = 1;
        const section = presetManager.createSection(this.l('usertype'), this._userType);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4427.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._userType.selected = def.intParams[0];
    }

    // AS3: _SafeCls_4427.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._userType.selected];
    }
}
