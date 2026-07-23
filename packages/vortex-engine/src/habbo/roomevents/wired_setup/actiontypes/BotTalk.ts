import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {TextAreaParam} from '../uibuilder/params/TextAreaParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextAreaPreset} from '../uibuilder/presets/TextAreaPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultBotActionType} from './DefaultBotActionType';

/**
 * BotTalk — the "make a bot talk / shout" wired action: a bot-name text input, a chat-message text
 * area and a talk/shout toggle, stored as the string param "name\tmessage" plus intParams [operation].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4365`; the name follows the code it returns
 * (ActionTypeCodes.BOT_TALK).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4365.as
 */
export class BotTalk extends DefaultBotActionType
{
    // AS3: _SafeCls_4365.as::STRING_PARAM_DELIMITER (declared but unused; AS3 uses the literal '\t' inline)
    private static readonly STRING_PARAM_DELIMITER: string = '\t';

    // AS3: _SafeCls_4365.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4365.as::_chatMessage
    private _chatMessage!: TextAreaPreset;

    // AS3: _SafeCls_4365.as::_SafeStr_7368 (name derived)
    private _operation!: RadioGroupPreset;

    // AS3: _SafeCls_4365.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.BOT_TALK;
    }

    // AS3: _SafeCls_4365.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botName.text + '\t' + this._chatMessage.text;
    }

    // AS3: _SafeCls_4365.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split('\t');

        this._botName.text = parts.length >= 1 ? parts[0] : '';
        this._chatMessage.text = parts.length === 2 ? parts[1] : '';
        this._operation.selected = def.getInt(0);
    }

    // AS3: _SafeCls_4365.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._operation.selected];
    }

    // AS3: _SafeCls_4365.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4365.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.bot.name')));
        const nameSection = presetManager.createSection(this.l('bot.name'), this._botName);

        this._chatMessage = presetManager.createTextArea(new TextAreaParam(40, -1, 8, -1, 200, '${wiredfurni.tooltip.bot.chatmessage}'));
        this._operation = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('talk')),
            new RadioButtonParam(1, this.l('shout'))
        ]);

        const listView = presetManager.createSimpleListView(true, [this._chatMessage, this._operation]);
        const messageSection = presetManager.createSection(this.l('message'), listView);

        builder.addElements(nameSection, messageSection);
    }
}
