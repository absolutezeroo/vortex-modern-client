import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultBotActionType} from './DefaultBotActionType';

/**
 * BotTeleport — the "teleport a bot" wired action: a single bot-name text input, stored as the string
 * param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4231`; the name follows the code it returns
 * (ActionTypeCodes.BOT_TELEPORT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4231.as
 */
export class BotTeleport extends DefaultBotActionType
{
    // AS3: _SafeCls_4231.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4231.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.BOT_TELEPORT;
    }

    // AS3: _SafeCls_4231.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botName.text;
    }

    // AS3: _SafeCls_4231.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._botName.text = def.stringParam;
    }

    // AS3: _SafeCls_4231.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4231.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.bot.name')));

        const section = presetManager.createSection(this.l('bot.name'), this._botName);

        builder.addElements(section);
    }
}
