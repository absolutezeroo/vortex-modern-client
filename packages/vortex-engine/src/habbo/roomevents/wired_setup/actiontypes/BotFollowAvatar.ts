import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultBotActionType} from './DefaultBotActionType';

/**
 * BotFollowAvatar — the "make a bot follow / stop following an avatar" wired action: a bot-name text
 * input and a start/stop toggle, stored as the string param plus intParams [operation].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4421`; the name follows the code it returns
 * (ActionTypeCodes.BOT_FOLLOW_AVATAR).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4421.as
 */
export class BotFollowAvatar extends DefaultBotActionType
{
    // AS3: _SafeCls_4421.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4421.as::_SafeStr_7368 (name derived)
    private _operation!: RadioGroupPreset;

    // AS3: _SafeCls_4421.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.BOT_FOLLOW_AVATAR;
    }

    // AS3: _SafeCls_4421.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botName.text;
    }

    // AS3: _SafeCls_4421.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._operation.selected];
    }

    // AS3: _SafeCls_4421.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._botName.text = def.stringParam;
        this._operation.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4421.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4421.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.bot.name')));
        this._operation = presetManager.createRadioGroup([
            new RadioButtonParam(1, this.l('start.following')),
            new RadioButtonParam(0, this.l('stop.following'))
        ]);

        const listView = presetManager.createSimpleListView(true, [this._botName, this._operation]);
        const section = presetManager.createSection(this.l('bot.name'), listView);

        builder.addElements(section);
    }
}
