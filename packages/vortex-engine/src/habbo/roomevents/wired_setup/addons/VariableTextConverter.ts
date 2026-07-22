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
 * VariableTextConverter — the "connect text to variables" wired addon: a text area whose content is
 * stored as the string param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4200`; the name follows the code it returns
 * (AddonCodes.VARIABLE_TEXT_CONVERTER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4200.as
 */
export class VariableTextConverter extends DefaultAddonType
{
    // AS3: _SafeCls_4200.as::_textInput
    private _textInput!: TextAreaPreset;

    // AS3: _SafeCls_4200.as::get code()
    override get code(): number
    {
        return AddonCodes.VARIABLE_TEXT_CONVERTER;
    }

    // AS3: _SafeCls_4200.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4200.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._textInput.text = def.stringParam;
    }

    // AS3: _SafeCls_4200.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._textInput.text;
    }

    // AS3: _SafeCls_4200.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._textInput = presetManager.createTextArea(new TextAreaParam(100, -1, 30, -1, 1000, '', this.l('variables.connect_text.caption')));
        const section = presetManager.createSection(this.l('variables.connect_text.title'), this._textInput);

        builder.addElements(section);
    }
}
