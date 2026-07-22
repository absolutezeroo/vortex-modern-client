import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextAreaParam} from '../uibuilder/params/TextAreaParam';
import type {TextAreaPreset} from '../uibuilder/presets/TextAreaPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * AchievementEnabler — the "enable achievement progress" wired addon: a text area for the achievement
 * configuration, stored as the string param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4107`; the name follows the code it returns
 * (AddonCodes.ACHIEVEMENT_ENABLER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4107.as
 */
export class AchievementEnabler extends DefaultAddonType
{
    // AS3: _SafeCls_4107.as::_text
    private _text!: TextAreaPreset;

    // AS3: _SafeCls_4107.as::get code()
    override get code(): number
    {
        return AddonCodes.ACHIEVEMENT_ENABLER;
    }

    // AS3: _SafeCls_4107.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4107.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._text.text;
    }

    // AS3: _SafeCls_4107.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._text.text = def.stringParam;
    }

    // AS3: _SafeCls_4107.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._text = presetManager.createTextArea(new TextAreaParam(60, -1, -1, 100, 2000, '', '${wiredfurni.params.achievement_enabler.placeholder}'));
        const section = presetManager.createSection('${wiredfurni.params.achievement_enabler}', this._text);

        builder.addElements(section);
    }
}
