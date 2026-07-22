import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {AvatarImagePreset} from '../uibuilder/presets/AvatarImagePreset';
import type {ButtonPreset} from '../uibuilder/presets/ButtonPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultBotActionType} from './DefaultBotActionType';

/**
 * BotChangeFigure — the "change a bot's figure" wired action: a bot-name text input plus a captured
 * figure (an avatar preview and a "capture my figure" button), stored as the string param
 * "name\tfigure".
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4278`; the name follows the code it returns
 * (ActionTypeCodes.BOT_CHANGE_FIGURE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4278.as
 */
export class BotChangeFigure extends DefaultBotActionType
{
    // AS3: _SafeCls_4278.as::STRING_PARAM_DELIMITER (declared but unused; AS3 uses the literal '\t' inline)
    private static readonly STRING_PARAM_DELIMITER: string = '\t';

    // AS3: _SafeCls_4278.as::_figureString
    private _figureString: string = '';

    // AS3: _SafeCls_4278.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4278.as::_SafeStr_8309 (name derived)
    private _avatarImage!: AvatarImagePreset;

    // AS3: _SafeCls_4278.as::_SafeStr_8793 (name derived)
    private _captureButton!: ButtonPreset;

    // AS3: _SafeCls_4278.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.BOT_CHANGE_FIGURE;
    }

    // AS3: _SafeCls_4278.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botName.text + '\t' + this._figureString;
    }

    // AS3: _SafeCls_4278.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split('\t');
        let name = '';

        if(parts.length > 0)
        {
            name = parts[0];
        }

        if(parts.length > 1)
        {
            this._figureString = parts[1];
        }

        this._botName.text = name;
        this._avatarImage.figure = this._figureString;
    }

    // AS3: _SafeCls_4278.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4278.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.bot.name')));
        const nameSection = presetManager.createSection(this.l('bot.name'), this._botName);

        this._avatarImage = presetManager.createAvatarImagePreset();
        this._captureButton = presetManager.createButton(this.l('capture.figure'), this.captureFigure);
        const figureSection = presetManager.createSection(this.l('capture.figure'), presetManager.createSimpleListView(true, [this._avatarImage.alignCenter(), this._captureButton]));

        builder.addElements(nameSection, figureSection);
    }

    // AS3: _SafeCls_4278.as::captureFigure()
    private captureFigure = (): void =>
    {
        this._figureString = this.roomEvents.sessionDataManager!.figure;
        this._avatarImage.figure = this._figureString;
    };
}
