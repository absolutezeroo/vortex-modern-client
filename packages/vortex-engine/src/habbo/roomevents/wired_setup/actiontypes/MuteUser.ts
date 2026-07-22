import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MuteUser — the "mute user" wired action: a message text input and a mute-length slider (0..10
 * minutes), stored as stringParam (message) plus intParams [minutes].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4144`; the name follows the code it returns
 * (ActionTypeCodes.MUTE_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4144.as
 */
export class MuteUser extends DefaultActionType
{
    // AS3: _SafeCls_4144.as::_message
    private _message!: TextInputPreset;

    // AS3: _SafeCls_4144.as::_length
    private _length!: SliderSection;

    // AS3: _SafeCls_4144.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MUTE_USER;
    }

    // AS3: _SafeCls_4144.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._message.text;
    }

    // AS3: _SafeCls_4144.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._length.value];
    }

    // AS3: _SafeCls_4144.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._message.text = def.stringParam;
        this._length.value = def.intParams[0];
    }

    // AS3: _SafeCls_4144.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4144.as::validate()
    override validate(): string | null
    {
        if(this._message.text.length > 100)
        {
            const key = 'wiredfurni.chatmsgtoolong';

            return this.roomEvents.localization.getLocalization(key, key);
        }

        return null;
    }

    // AS3: _SafeCls_4144.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._message = presetManager.createTextInput(new TextInputParam('', 100));
        const section = presetManager.createSection('${wiredfurni.params.message}', this._message);
        this._length = presetManager.createSliderSection('wiredfurni.params.length.minutes', 'minutes', SliderSection.CONVERTER_ECHO, 0, 10, 1);
        this._length.value = 1;

        builder.addElements(section, this._length);
    }
}
