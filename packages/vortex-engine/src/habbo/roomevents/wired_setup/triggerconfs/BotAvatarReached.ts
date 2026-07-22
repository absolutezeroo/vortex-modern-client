import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * BotAvatarReached — the "a bot reaches an avatar" wired trigger: a single bot-name text input, stored
 * as the string param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4120`; the name follows the code it returns
 * (TriggerConfCodes.BOT_AVATAR_REACHED); the 2016 PRODUCTION build named the code-14 trigger
 * BotReachedAvatar.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4120.as
 */
export class BotAvatarReached extends DefaultTriggerConf
{
    // AS3: _SafeCls_4120.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4120.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.BOT_AVATAR_REACHED;
    }

    // AS3: _SafeCls_4120.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botName.text;
    }

    // AS3: _SafeCls_4120.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4120.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.botname')));
        const section = presetManager.createSection(this.l('bot.name'), this._botName);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4120.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._botName.text = def.stringParam;
    }

    // AS3: _SafeCls_4120.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title.bots';
    }
}
