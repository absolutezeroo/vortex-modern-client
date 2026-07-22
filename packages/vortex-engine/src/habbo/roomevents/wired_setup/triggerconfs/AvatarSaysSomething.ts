import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {Util} from '../../Util';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarSaysSomething — the "an avatar says something" wired trigger: a chat text input, a match-type
 * selector (contains/exact/all — "all" disables the text input) and two options (hide message / only
 * owner). Stored as the chat text plus intParams [onlyOwner, matchType, hide].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4100`; the name follows the code it returns
 * (TriggerConfCodes.AVATAR_SAYS_SOMETHING), matching the 2016 PRODUCTION AvatarSaysSomething.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4100.as
 */
export class AvatarSaysSomething extends DefaultTriggerConf
{
    // AS3: _SafeCls_4100.as::_chatInput
    private _chatInput!: TextInputPreset;

    // AS3: _SafeCls_4100.as::_triggerType
    private _triggerType!: RadioGroupPreset;

    // AS3: _SafeCls_4100.as::_options
    private _options!: CheckboxGroupPreset;

    // AS3: _SafeCls_4100.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_SAYS_SOMETHING;
    }

    // AS3: _SafeCls_4100.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4100.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._chatInput = presetManager.createTextInput(new TextInputParam('', 1000, null, -1, null, true, this.loc('wiredfurni.tooltip.chatinput')));
        this._triggerType = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('chatcontains')),
            new RadioButtonParam(1, this.l('exactmatch')),
            new RadioButtonParam(2, this.l('allmatch'))
        ], this._onTriggerTypeChange);
        this._options = presetManager.createCheckboxGroup([
            new CheckboxOptionParam(this.l('chat.hide'), 1),
            new CheckboxOptionParam(this.l('chat.onlyowner'), 0)
        ]);

        builder.addElements(presetManager.createSection(this.l('whatissaid'), this._chatInput), presetManager.createSection(this.l('chattriggertype'), this._triggerType), presetManager.createSection(this.l('select_options'), this._options));
    }

    // AS3: _SafeCls_4100.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._options.optionById(0).selected ? 1 : 0, this._triggerType.selected, this._options.optionById(1).selected ? 1 : 0];
    }

    // AS3: _SafeCls_4100.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._chatInput.text;
    }

    // AS3: _SafeCls_4100.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._chatInput.text = def.stringParam;

        const intParams = def.intParams;
        this._options.optionById(0).selected = intParams[0] !== 0;
        this._options.optionById(1).selected = intParams[2] !== 0;
        this._triggerType.selected = intParams[1];
        this._onTriggerTypeChange(this._triggerType.selected);
    }

    // AS3: _SafeCls_4100.as::onTriggerTypeChange()
    private _onTriggerTypeChange = (selected: number): void =>
    {
        Util.disableSection(this._chatInput.window, selected === 2);
    };
}
